# StudyDrop Project Brief

## Project context

- This project is for the Codebox at Cal Poly SLO hackathon and is effectively a tryout.
- The submission deadline is Tuesday at 11:59 PM.
- The final submission must include:
  - A publicly deployed web application
  - A GitHub repository
  - A five-minute demo video
  - A tech-stack explanation
  - A track selection
  - A problem statement
  - The motivation for the product
  - A product walkthrough
- This is the creator's first substantial web application.
- Optimize for a finished, useful, polished, and reliable product rather than an ambitious but incomplete one.

## Preferred stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Supabase
- Vercel

The application should demonstrate appropriate full-stack fundamentals, including authentication, database-backed data, CRUD operations, filtering, validation, responsive design, and complete loading, empty, and error states.

Avoid fragile scraping, private university APIs, expensive services, complex infrastructure, unnecessary AI, and features that depend on a large initial user base.

## Product direction: StudyDrop

> StudyDrop helps Cal Poly students create and discover small, course-specific study sessions happening soon.

StudyDrop is not a generic, permanent study-group marketplace. Each session is time-bounded and tied to:

- A Cal Poly course
- A specific purpose, such as homework, exam review, project work, concept questions, or quiet co-working
- A collaboration style
- A physical or online meeting location
- A start and end time
- A limited capacity
- Public or unlisted-link visibility

## Cold-start strategy

Creators can share unlisted session links in existing class Discords, GroupMe chats, Canvas discussions, or text messages. This makes StudyDrop useful before it has a large public community.

## P0: Required MVP features

- Landing page
- Browse upcoming sessions
- Search and filter by course, date, purpose, and collaboration style
- Session detail page
- Create, edit, and cancel sessions
- Join and leave sessions
- Capacity enforcement
- Starting soon, full, in progress, cancelled, and ended states
- Public and unlisted sessions
- Signup, login, and logout
- Dashboard for hosted, joined, and past sessions
- Organizer notes and meeting instructions
- Responsive mobile design
- Validation and complete loading, empty, and error states
- Supabase row-level security
- Public Vercel deployment

## Confirmed P0 product decisions

- Registration is restricted to email addresses whose exact domain is `calpoly.edu`; users must confirm ownership of the address before using authenticated features.
- Session capacity is the total number of people, including the organizer. The organizer is not duplicated in the participant table.
- A session is “starting soon” beginning 60 minutes before its scheduled start.
- Joining and leaving remain open through a 15-minute grace period after the scheduled start, provided the session has not ended or been cancelled.
- All session fields become read-only at the scheduled start. The organizer may still cancel an in-progress session, but may not edit it.
- Organizer notes and meeting instructions are visible to anyone who can view the session detail link, whether the session is public or unlisted.
- P0 collaboration styles are Collaborative, Focused, and Peer Teaching.
- The course picker is a searchable dropdown containing a reviewed static snapshot of all courses in Cal Poly's official 2026–2028 Academic Catalog. There is no runtime scraping, schedule import, section data, or course-specific behavior.
- Cancelled sessions appear under Past in the dashboard with a prominent Cancelled badge; known detail links remain accessible.
- P0 displays occupancy counts only and has no participant roster.

## P1: Enhancements after P0 is reliable

- Calendar download
- Repeat a previous session
- Beginner-friendly badge
- Waitlist
- Attendance confirmation
- Basic profiles
- In-app reminders

## Explicit non-goals for the initial build

- Real-time chat
- Push notifications
- Google Calendar OAuth
- Cal Poly SSO
- Live location tracking
- Friend systems
- AI recommendations
- Automated schedule importing
- Maps
- Room-availability detection

These items must not be added to the initial build unless the project owner explicitly approves a scope change.

## Scope note

P0 is the committed MVP. P1 is optional and should begin only after P0 is complete and reliable. No separate P2 feature set has been defined yet; any future P2 ideas must remain deferred until explicitly agreed upon and recorded here.

For the hackathon demo, implementation may first target the smaller **Demo MVP checkpoint** defined in `IMPLEMENTATION_PLAN.md` and `TEST_CHECKLIST.md`. That checkpoint is a presentable vertical slice, not completion of P0; deferred P0 requirements remain required before claiming P0 complete.
