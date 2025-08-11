import { faker } from "@faker-js/faker";

const randomContacts = Array.from({ length: 10 }, () => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  company: faker.company.name(),
  position: faker.person.jobTitle(),
  location: faker.address.city(),
  status: faker.helpers.arrayElement(['active', 'inactive', 'prospect']),
  lastContact: faker.date.recent().toISOString().split('T')[0],
  createdAt: faker.date.past().toISOString().split('T')[0]
}));

console.log(randomContacts);