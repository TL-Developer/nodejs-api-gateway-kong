const express = require("express");
const { faker } = require('@faker-js/faker');
const app = express();
const port = process.env.PORT || 3000;

let counter = 0;

app.get("/user", (req, res) => {
  counter++;
  console.log(`Request number ${counter}`);
  res.json({
    fullName: faker.person.fullName(),
    gender: faker.person.gender(),
    bio: faker.person.bio(),
    jobTitle: faker.person.jobTitle(),
    jobDescriptor: faker.person.jobDescriptor(),
    zodiacSign: faker.person.zodiacSign(),
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});