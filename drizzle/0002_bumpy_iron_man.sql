ALTER TABLE "payments" DROP CONSTRAINT "payments_booking_id_bookings_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "properties" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "is_verified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_active" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "is_verified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_primary_image_per_property" ON "property_images" USING btree ("property_id") WHERE "property_images"."is_primary" = true;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "income_positive" CHECK ("applications"."monthly_income" >= 0);--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "booking_dates_valid" CHECK ("bookings"."end_date" > "bookings"."start_date");--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "rent_positive" CHECK ("bookings"."monthly_rent" >= 0);--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "deposit_positive" CHECK ("bookings"."security_deposit" >= 0);--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "total_positive" CHECK ("bookings"."total_amount" >= 0);--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "estimated_cost_positive" CHECK ("maintenance_requests"."estimated_cost" >= 0);--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "actual_cost_positive" CHECK ("maintenance_requests"."actual_cost" >= 0);--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "amount_positive" CHECK ("payments"."amount" >= 0);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "rent_positive" CHECK ("properties"."monthly_rent" >= 0);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "deposit_positive" CHECK ("properties"."security_deposit" >= 0);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "area_positive" CHECK ("properties"."area_sqft" > 0);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "bedrooms_valid" CHECK ("properties"."bedrooms" >= 0);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "bathrooms_valid" CHECK ("properties"."bathrooms" >= 0);--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "lease_valid" CHECK ("properties"."lease_duration_months" > 0);