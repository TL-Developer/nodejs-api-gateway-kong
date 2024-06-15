# RUN PROJECT

```docker compose up```

# RUN PROJECT AND BUILD ALL

```docker compose up --build```

# REMOVE PROJECT
```docker compose down```

# Address on Kong

* http://localhost:8000/ - gateway input
* http://localhost:8001/ - ADMIN API
* http://localhost:8002/ - ADMIN GUI

# Access container kong

```docker compose exec kong bash```+

# Host Docker Internal

windows -> c: windows system32 drivers etc hosts (notepad hosts modo admin)
127.0.0.1 host.docker.internal

Reference: https://www.youtube.com/watch?v=uY_cp41E7SU

# CREATE GATEWAY SERVICE

| Name | Protocol | Host | Port | Path | Enabled | Tags
|----------|----------|----------|----------|----------|----------|----------|
| User    | http   | host.docker.internal | 3000 | /user	| yes | - |

# CREATE ROUTE

| Name | Protocols | Host | Methods | Paths  | Tags
----------|----------|----------|----------|----------|----------|
| User    | http/https   | -  | GET | /user	| yes | - |

# CREATE CONSUMER

| Name | Custom ID | Tags |
----------|----------|----------|
| node-api | -   | -  |

# GENERATE CREDENTIAL TO NODE-API CONSUMER

| Key | Created at | Tags |
----------|----------|----------|
| node-api-key-auth | Jun 15, 2024, 7:25 PM   | -  |

# CONFIG PLUGIN KEY AUTH
```
id: 9f14c49a-3625-41e5-9adf-ae8e58e4925e
name: key-auth
config:
  realm: null
  key_in_header: true
  key_in_query: false
  key_in_body: false
  hide_credentials: false
  run_on_preflight: true
  anonymous: null
  key_names:
    - subscription
enabled: true
protocols:
  - grpc
  - grpcs
  - http
  - https
```

# RUN GET USER

run method GEt /user into file rest.http

```
GET http://localhost:8000/user
subscription: node-api-key-auth
```

# CONFIG PLUGIN JTW AND GENERATE CREDENTIAL JWT INTO NODE-API CONSUMER

Advanced Parameters:
Claims To Verify: exp

| Key | Secret | Algorithm | Created at | Tags |
----------|----------|----------|----------|----------|
| node-api-key-jwt | node-api-key-secret | HS256 | Jun 15, 2024, 7:25 PM   | -  |

Generate token on jwt.io with:

HEADER
```
{
  "alg": "HS256",
  "typ": "JWT"
}
```

PAYLOAD (generate exp https://www.unixtimestamp.com/)
```
{
  "iss": "node-api-key-jwt",
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1750038121
}
```

VERIFY SIGNATURE
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "node-api-key-secret"
)
```

copy the token generated into file rest.http with:
```
GET http://localhost:8000/user
subscription: node-api-key-auth
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJub2RlLWFwaS1rZXktand0Iiwic3ViIjoiMTIzNDU2Nzg5MCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMn0.4U2_Fhmrth7nbv2kO77Ygb6LkOR7zRGxkN_bYK3xMRM
```

![alt text](image.png)

# CONFIG RATE LIMIT

10 requests per minute into plugin Global or per Routes / Plugins

test:
![alt text](image-1.png)


# CONFIG LOAD BALANCER WITH UPSTREAMS

| Name | Slots | Tags |
----------|----------|----------|
| upstream-node | 10000  | -  |

AND Edit upstream-node > Targets

| Target Address | Weight | Tags |
----------|----------|----------|
| host.docker.internal:3000 (node-api-port) | 10000  | -  |
| host.docker.internal:3001 (node-api-port) | 10000  | -  |

ADD new Gateway Services

| Name | Protocol | Host | Port | Path | Enabled | Tags
|----------|----------|----------|----------|----------|----------|----------|
| load-balance    | http   | upstream-node | 3000 | /user	| yes | - |

ADD new Route

| Name | Protocols | Host | Methods | Paths  | Tags
----------|----------|----------|----------|----------|----------|
| load-balance    | http/https   | -  | GET | /load-balance	| yes | - |

Test into file rest.http

```

GET http://localhost:8000/user
subscription: node-api-key-auth
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJub2RlLWFwaS1rZXktand0Iiwic3ViIjoiMTIzNDU2Nzg5MCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzUwMDM4MTIxfQ.PdIsDSbeYUUrzXIPbcpsNPmJImctHqF_CyARXeJR8l4

###

GET http://localhost:8000/load-balance
subscription: node-api-key-auth
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJub2RlLWFwaS1rZXktand0Iiwic3ViIjoiMTIzNDU2Nzg5MCIsIm5hbWUiOiJKb2huIERvZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzUwMDM4MTIxfQ.PdIsDSbeYUUrzXIPbcpsNPmJImctHqF_CyARXeJR8l4

```