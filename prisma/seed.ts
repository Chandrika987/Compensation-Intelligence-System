import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { normalizeCompanyName, generateSubmissionFingerprint } from "../src/lib/company-normalization";
import { calculateTotalCompensation } from "../src/lib/compensation";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const COMPANIES = [
  { name: "Google", levels: [
    { code: "L3", name: "Software Engineer II" },
    { code: "L4", name: "Software Engineer III" },
    { code: "L5", name: "Senior Software Engineer" },
    { code: "L6", name: "Staff Software Engineer" },
  ]},
  { name: "Meta", levels: [
    { code: "E3", name: "Software Engineer" },
    { code: "E4", name: "Software Engineer" },
    { code: "E5", name: "Senior Software Engineer" },
    { code: "E6", name: "Staff Software Engineer" },
  ]},
  { name: "Amazon", levels: [
    { code: "SDE I", name: "Software Development Engineer I" },
    { code: "SDE II", name: "Software Development Engineer II" },
    { code: "SDE III", name: "Software Development Engineer III" },
    { code: "Principal SDE", name: "Principal SDE" },
  ]},
  { name: "Microsoft", levels: [
    { code: "59", name: "Software Engineer" },
    { code: "60", name: "Software Engineer II" },
    { code: "61", name: "Senior Software Engineer" },
    { code: "62", name: "Principal Software Engineer" },
  ]},
  { name: "Apple", levels: [
    { code: "ICT2", name: "Software Engineer" },
    { code: "ICT3", name: "Software Engineer" },
    { code: "ICT4", name: "Senior Software Engineer" },
    { code: "ICT5", name: "Staff Software Engineer" },
  ]},
];

const ROLES = ["Software Engineer", "Product Manager", "Data Scientist", "Engineering Manager"];

const LOCATIONS = [
  { city: "San Francisco", state: "CA", country: "United States" },
  { city: "Seattle", state: "WA", country: "United States" },
  { city: "New York", state: "NY", country: "United States" },
  { city: "Austin", state: "TX", country: "United States" },
  { city: "Bangalore", state: "Karnataka", country: "India" },
  { city: "London", state: "", country: "United Kingdom" },
];

function randomBetween(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

async function main() {
  console.log("Seeding database...");

  for (const roleName of ROLES) {
    await prisma.role.upsert({
      where: { name: roleName },
      create: { name: roleName },
      update: {},
    });
  }

  for (const loc of LOCATIONS) {
    await prisma.location.upsert({
      where: {
        city_state_country: {
          city: loc.city,
          state: loc.state,
          country: loc.country,
        },
      },
      create: loc,
      update: {},
    });
  }

  for (const comp of COMPANIES) {
    const { name, normalizedName } = normalizeCompanyName(comp.name);
    const company = await prisma.company.upsert({
      where: { normalizedName },
      create: {
        name,
        normalizedName,
        website: `https://${normalizedName}.com`,
      },
      update: {},
    });

    for (const level of comp.levels) {
      await prisma.level.upsert({
        where: {
          companyId_levelCode: { companyId: company.id, levelCode: level.code },
        },
        create: {
          companyId: company.id,
          levelCode: level.code,
          levelName: level.name,
        },
        update: { levelName: level.name },
      });
    }
  }

  const companies = await prisma.company.findMany({ include: { levels: true } });
  const roles = await prisma.role.findMany();
  const locations = await prisma.location.findMany();

  const baseSalaries: Record<string, [number, number]> = {
    "L3": [120000, 160000], "E3": [115000, 155000], "SDE I": [110000, 150000],
    "59": [105000, 145000], "ICT2": [110000, 150000],
    "L4": [160000, 210000], "E4": [155000, 205000], "SDE II": [150000, 200000],
    "60": [145000, 195000], "ICT3": [150000, 200000],
    "L5": [210000, 280000], "E5": [200000, 270000], "SDE III": [195000, 265000],
    "61": [190000, 260000], "ICT4": [195000, 265000],
    "L6": [280000, 380000], "E6": [270000, 370000], "Principal SDE": [260000, 360000],
    "62": [255000, 355000], "ICT5": [260000, 360000],
  };

  let created = 0;

  for (const company of companies) {
    for (const level of company.levels) {
      for (let i = 0; i < randomBetween(2, 5); i++) {
        const role = roles[Math.floor(Math.random() * roles.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const range = baseSalaries[level.levelCode] ?? [100000, 200000];
        const baseSalary = randomBetween(range[0], range[1]);
        const bonus = randomBetween(0, Math.round(baseSalary * 0.2));
        const stock = randomBetween(0, Math.round(baseSalary * 0.5));
        const yearsExperience = randomBetween(1, 15);
        const totalCompensation = calculateTotalCompensation(baseSalary, bonus, stock);

        const fingerprint = generateSubmissionFingerprint({
          companyId: company.id,
          roleId: role.id,
          levelId: level.id,
          locationId: location.id,
          baseSalary,
          bonus,
          stock,
          yearsExperience,
        });

        try {
          await prisma.salarySubmission.create({
            data: {
              companyId: company.id,
              roleId: role.id,
              levelId: level.id,
              locationId: location.id,
              baseSalary,
              bonus,
              stock,
              totalCompensation,
              yearsExperience,
              fingerprint,
              submittedAt: new Date(
                Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
              ),
            },
          });
          created++;
        } catch {
          // Skip duplicates
        }
      }
    }
  }

  console.log(`Seed complete: ${created} salary submissions created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
