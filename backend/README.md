## Starter Commands

1. Git clone

> git clone *repo*

2. Install needed packages

> npm install

3. Run using nodemon

> npm run dev

or

> npm start

4. Go to `localhost:3000`

## Routes

### 1. Main Home Page

1. `GET` `/`

- Renders the main home page.
- Fetches three most recent and three most recent highlighted events to display on the home page.
- Shows when they were last updated

### 2. Become Page

1. `GET` `become/volunteer`

- Renders the "Become Volunteer" form.

2. `POST` `become/volunteer`

- Handles the submission of the volunteer registration form.
- Inserts the provided data into the database.

### 3. Events Management

1.  `GET` `/events`

- Renders the events home page using pagination.
- Displays events based on specified page and items per page.

2. `GET` `/events/new`

- Renders the form to create a new event.

3. `POST` `/events/new`

- Handles the submission of the new event form.
- Inserts the provided event data into the database.

4. `GET` `/events/detail/:id`

- Displays details of a single event based on the given event ID.

5. `GET` `/events/edit/:id`

- Renders the form to edit an existing event.
- Pre-fills it.

6. `POST` `/events/edit/:id`

- Handles the submission of the edit event form.
- Updates the event details in the database.

7. `POST` `/events/delete/:id`

- Handles the deletion of a single event based on the given event ID.

### Event schema

1. Event Title
2. organizer
3. Datetime
4. location
5. Description
6. quota
7. Image link

- Save button
- Edit button
- Delete Button
