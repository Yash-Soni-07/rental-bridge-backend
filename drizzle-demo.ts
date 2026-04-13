import { properties, tenants } from "./src/db/schema";
import { db } from "./src/db";

async function demo() {
    console.log("🚀 Running Rental Bridge Demo...\n");

    // Insert a property
    const [newProperty] = await db.insert(properties).values({
        title: "Modern Downtown Apartment",
        address: "123 Main St, Suite 4B",
        rentAmount: "2500.00",
        isAvailable: true,
    }).returning();
    console.log("✅ Created property:", newProperty);

    // Insert a tenant
    const [newTenant] = await db.insert(tenants).values({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "555-0101",
    }).returning();
    console.log("✅ Created tenant:", newTenant);

    // Query all
    const allProperties = await db.select().from(properties);
    console.log("\n📋 All properties:", allProperties);
}

demo().catch(console.error);