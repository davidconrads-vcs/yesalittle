import { ContentPage } from '../types'

export const page: ContentPage = {
  slug: 'spain/restaurant',
  target: 'es-ES',
  native: 'en-US',
  scenario: 'restaurant',

  title: 'Eating Out in Spain: What Waiters Actually Say (and How to Reply)',
  metaDescription:
    "The Spanish you'll actually hear in a restaurant in Spain — from ¿Para cuántos? at the door to ¿Junto o por separado? at the end. With audio for every phrase.",
  published: '2026-09-08',
  updated: '2026-09-08',

  eyebrow: 'Spain · Restaurant',
  h1: 'Eating Out in Spain: What Waiters Actually Say',
  standfirst:
    'Most phrasebooks teach you how to order. The hard part is understanding the reply — and in a Spanish restaurant, the waiter speaks first.',

  lead: [
    'The first Spanish you\'ll hear in a restaurant isn\'t a greeting. It\'s <em>"¿Para cuántos?"</em> — how many of you — fired at you before you\'re fully through the door. If you\'re braced to deliver a memorized sentence about a table for four, you\'ll miss it entirely.',
    'That\'s the pattern for the whole meal. You will spend far more time <em>listening</em> than talking, and the phrases that trip people up aren\'t the ones in the phrasebook — they\'re the quick, routine questions a server asks a hundred times a day without slowing down.',
  ],

  headsUp: {
    title: 'Three things that catch people out',
    items: [
      '<strong>The bill never comes on its own.</strong> Sitting patiently after dessert is a Spanish waiter\'s signal that you\'re happy. You have to ask.',
      '<strong>The menú del día is a structure, not a dish.</strong> First course, second course, dessert, usually with a drink, at a fixed weekday price.',
      '<strong>Sitting outside can cost more.</strong> Terrace seating often carries a per-drink surcharge, and they\'ll tell you as you sit down.',
    ],
  },

  sections: [
    {
      heading: 'Getting seated',
      note: "This happens fast, usually while you're still standing in the doorway.",
      prompts: ['rest-001', 'rest-003', 'rest-004', 'rest-018'],
    },
    {
      heading: 'Ordering',
      note: 'Where the menú del día appears, and where most confusion lives.',
      prompts: ['rest-010', 'rest-011', 'rest-005', 'rest-006', 'rest-007'],
    },
    {
      heading: 'Finishing and paying',
      note: 'The part travellers get wrong most often — nothing happens until you ask.',
      prompts: ['rest-009', 'rest-015'],
    },
  ],

  notes: {
    'rest-004':
      'Worth knowing before you answer — the terrace often costs more. That\'s the next exchange.',
    'rest-010':
      "The <em>menú del día</em> is a fixed-price weekday lunch — typically three courses and a drink for around €12–15. It's usually the best value on the table, and often not written in English anywhere.",
    'rest-006':
      "Ask for <em>agua del grifo</em> and it's free. Say just <em>agua</em> and you'll get a bottle you pay for.",
    'rest-009':
      'This is usually your best opening to ask for the bill. Take it — otherwise you may be sitting a while.',
  },

  midHook: {
    after: 'Getting seated',
    text: "All four of these land in the first thirty seconds, usually before you've sat down.",
    linkText: 'Hear them at full speed →',
    href: '/?scenario=restaurant&target=es-ES',
  },

  cta: {
    heading: 'Now try it without reading',
    body: "Same exchanges, at conversation speed, with the answers hidden. Find out whether you'd actually catch them.",
    buttonText: 'Practice restaurant Spanish →',
    href: '/?scenario=restaurant&target=es-ES',
  },

  related: {
    title: 'Other situations in Spain',
    links: [
      { href: '/spain/cafe', text: "At a café or bar → what they ask before you've said a word" },
      { href: '/spain/grocery', text: 'At the supermarket → the checkout questions, and why bags cost money' },
      { href: '/spain/pharmacy', text: "At the pharmacy → describing what's wrong, and dosage instructions" },
      { href: '/spain/getting-around', text: 'Getting around → directions, taxis, and the metro' },
    ],
  },
}
