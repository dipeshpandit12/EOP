import mongoose, { Schema, Document } from 'mongoose'

interface ProposalStatusSection {
  completed: boolean
  generatedText?: string | null
  lastRuleIndexAsked?: number
}

export interface IProposal extends Document {
  userId: string
  email: string
  status: {
    information: ProposalStatusSection
    assessment: ProposalStatusSection
    responsePlan: ProposalStatusSection
    review: {
      completed: boolean
      finalGeneratedEOP: string | null
    }
  }
  createdAt: Date
  lastUpdated: Date
}

const SectionSchema: Schema = new Schema({
  completed: { type: Boolean, required: true },
  generatedText: { type: String, default: null },
  lastRuleIndexAsked: { type: Number, default: -1 }
})


const ProposalSchema: Schema = new Schema<IProposal>({
  userId: { type: String, required: true },
  status: {
    information: { type: SectionSchema, required: true },
    assessment: { type: SectionSchema, required: true },
    responsePlan: { type: SectionSchema, required: true },
    review: {
      completed: { type: Boolean, default: false },
      finalGeneratedEOP: { type: String, default: null }
    }
  },
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
})

// Fix model caching for hot reload
export default mongoose.models.Proposal || mongoose.model<IProposal>('Proposal', ProposalSchema)