const {GoogleGenAI, Type} = require("@google/genai");
const {z} = require("zod");

const env = require("../config/env");

const ai = env.geminiApiKey ? new GoogleGenAI({apiKey: env.geminiApiKey}) : null;

const linkSchema = {
    type: Type.OBJECT,
    properties: {
        label: {type: Type.STRING},
        url: {type: Type.STRING},
    },
}

const responseSchema = {
    type: Type.OBJECT,
    required: ["basics", "summary", "experience", "education", "skills", "projects", "certifications", "languages", "interests"],
    properties: {
        basics: {
            type: Type.OBJECT,
            required: ["name", "title", "location",  "email", "phone", "links"],
            properties: {
                name: {type: Type.STRING},
                title: {type: Type.STRING},
                location: {type: Type.STRING},
                email: {type: Type.STRING},
                phone: {type: Type.STRING},
                links: { type: Type.ARRAY, items: linkSchema },
            }
        },
        summary: {type: Type.STRING},
        experience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["company", "role", "period", "bullets"],
                properties: {
                    company: {type: Type.STRING},
                    role: {type: Type.STRING},
                    location: {type: Type.STRING},
                    period: {type: Type.STRING},
                    bullets: { type: Type.ARRAY, items: {type: Type.STRING} },
                }
            }
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["degree", "school", "period"],
                properties: {
                    degree: {type: Type.STRING},
                    school: {type: Type.STRING},
                    location: {type: Type.STRING},
                    period: {type: Type.STRING},
                    details: {type: Type.STRING},
                }
            }
        },
        skills: {
            type: Type.ARRAY,
            items: {type: Type.STRING}
        },
        projects: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["name", "description"],
                properties: {
                    name: {type: Type.STRING},
                    description: {type: Type.STRING},
                    tech: { type: Type.ARRAY, items: {type: Type.STRING} },
                    links: { type: Type.ARRAY, items: linkSchema },
                }
            }
        },
        certifications: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                required: ["name"],
                properties: {
                    name: {type: Type.STRING},
                    issuer: {type: Type.STRING},
                    year: {type: Type.STRING},
                }
            }
        },
        languages: { type: Type.ARRAY, items: {type: Type.STRING}},
        interests: { type: Type.ARRAY, items: {type: Type.STRING}}
    }
}