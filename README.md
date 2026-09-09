# StudyDrop

## About the project

StudyDrop is a web app built for Cal Poly students who need to study with other people, but do not want to spend twenty minutes searching through group chats, Discord servers, and text threads just to find a useful session. The project was inspired by a very common student problem: we often know what class we need help in and what kind of work we need to do, but it is surprisingly hard to find a quick, structured study opportunity that matches the moment.

I wanted to create a product that turns “I should study” into a concrete next step. StudyDrop makes it easy to find or create small, course-specific study sessions that are time-bounded, purposeful, and easy to join. Instead of a permanent marketplace or random social network, the app focuses on short, focused gatherings that are useful right now.

## What inspired me

The idea for StudyDrop came from my own experience as a student trying to study with classmates. A lot of students are in the same courses, but they are spread across different group chats and communication channels. Someone might need homework help, another person might be preparing for an exam, and someone else may want a quiet coworking session—but none of these people naturally connect in one place.

That gap made me think of a simple but powerful product: a lightweight platform where students can create tiny, specific study sessions tied to a course and a purpose. The app is intentionally small and purposeful. It does not try to become a giant social platform; it just helps students show up to the right session at the right time.

## What I built

StudyDrop lets users:

- Browse upcoming study sessions by course, date, purpose, and collaboration style
- See the session details before joining
- Create, edit, and cancel their own sessions
- Join or leave sessions while respecting capacity limits and time-based rules
- View hosted, joined, and past sessions from a personal dashboard
- Share unlisted session links in class Discords or group chats
- Use a verified Cal Poly email experience for account flows

The app is built with Next.js, TypeScript, React, and Tailwind CSS, with a mock demo flow to make the MVP feel complete while staying focused on a polished user experience.

## What I learned

This project taught me a lot about turning an idea into a dependable, user-focused product. I learned how to translate a real-world need into a product flow, structure the app around clear user journeys, and design for edge cases such as capacity limits, cancellation states, and session lifecycle rules.

I also learned a lot about full-stack product thinking. Even though the goal was a small app, the underlying design had to consider:

- user authentication and access rules
- database-backed data modeling
- validation and safe state transitions
- realistic loading and empty states
- responsive design for mobile and desktop
- building a product that feels useful even before it has a large user base

## How I built it

I built StudyDrop as a Next.js app using the App Router and TypeScript. The front end focuses on a clean, student-friendly interface that makes it easy to browse sessions and understand the purpose of each one. The app logic includes session filtering, status handling, and a session lifecycle model that covers states like upcoming, starting soon, full, in progress, cancelled, and ended.

The project is structured around a simple product flow:

1. Students land on the page and browse sessions.
2. They filter by course and session intent.
3. They join or create a session that matches their goals.
4. They use a dashboard to manage the sessions they host and attend.
5. They share links to unlisted sessions in the communities they already use.

I also used a mock authentication and session data setup for the demo phase so the app could feel complete without depending on heavy infrastructure. This allowed me to focus on delivering a polished MVP and validating the product direction quickly.

## Challenges I faced

One of the biggest challenges was designing a product that feels useful without being bloated. A lot of study apps try to be too broad, but StudyDrop needed to stay focused on a very narrow and valuable need: short, course-specific study sessions that happen soon.

I also had to think carefully about the product rules. For example, the app needed to enforce session capacity, handle time-based transitions, and model statuses like starting soon and in progress without introducing confusing edge cases. These rules made the interface more realistic, but also made the data and logic more complex.

Another challenge was balancing polish with practicality. I wanted the app to look professional and be easy to use, but I also needed to keep the MVP reliable and not overbuild features that were outside the project scope. That meant prioritizing a finished experience over trying to add too many extras.

## Why this project matters

StudyDrop is meant to make everyday student collaboration easier. Students already have a reason to meet and a reason to study together; the missing piece is a simple way to discover and coordinate those moments. I wanted to build something that helps students move from procrastination or isolation to action and accountability.

This project reminded me that good product ideas often come from small, frustrating everyday experiences. When the problem is real and specific, the solution can be simple, practical, and genuinely helpful.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vitest
- Playwright

## Project status

This is a polished MVP focused on the demo checkpoint and the core StudyDrop experience: browse, create, join, and manage course-based study sessions with a strong, mobile-friendly user experience.
