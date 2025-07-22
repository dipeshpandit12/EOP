import { NextResponse } from "next/server";
import RulesBankModel, { demoRulesBank } from "@/models/rulesBank";
import { dbConnect } from "@/lib/db"; // <-- Import your dbConnect

export async function POST() {
  try {
    await dbConnect(); // <-- Ensure DB connection before any model usage
    const existing = await RulesBankModel.findOne();
    if (existing) {
      return NextResponse.json({ success: false, message: "RulesBank already exists." }, { status: 200 });
    }
    await RulesBankModel.create(demoRulesBank);
    return NextResponse.json({ success: true, message: "RulesBank created." }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to create RulesBank." }, { status: 500 });
  }
}