import Item from "@/models/Item";

export const SEED_ITEMS = [
  {
    name: "Iron Resolve",
    description: "An unyielding talisman forged to reinforce moral grit and mental tenacity.",
    price: 25,
    type: "Relic",
    attributeBonus: {
      strength: 0,
      intellect: 0,
      vitality: 0,
      focus: 0,
      discipline: 10,
    },
  },
  {
    name: "Scholar's Sigil",
    description: "An arcane cipher that sharpens analytical reasoning and theoretical mastery.",
    price: 35,
    type: "Tome",
    attributeBonus: {
      strength: 0,
      intellect: 12,
      vitality: 0,
      focus: 0,
      discipline: 0,
    },
  },
  {
    name: "Vitality Core",
    description: "A pulsating bio-crystal that energizes cellular recovery and stamina.",
    price: 30,
    type: "Artifact",
    attributeBonus: {
      strength: 0,
      intellect: 0,
      vitality: 10,
      focus: 0,
      discipline: 0,
    },
  },
  {
    name: "Focus Lens",
    description: "An obsidian monocle eliminating cognitive distraction and noise.",
    price: 40,
    type: "Accessory",
    attributeBonus: {
      strength: 0,
      intellect: 0,
      vitality: 0,
      focus: 15,
      discipline: 0,
    },
  },
  {
    name: "Titan Grip",
    description: "Gauntlets woven with kinetic weave, boosting physical exertion and power.",
    price: 50,
    type: "Armor",
    attributeBonus: {
      strength: 15,
      intellect: 0,
      vitality: 0,
      focus: 0,
      discipline: 0,
    },
  },
];

export async function ensureArmoryCatalogSeeded() {
  for (const item of SEED_ITEMS) {
    await Item.findOneAndUpdate(
      { name: item.name },
      { $set: item },
      { upsert: true, new: true }
    );
  }
}
