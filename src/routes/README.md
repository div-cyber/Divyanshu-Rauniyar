# Routes

This directory contains page modules for the React app powered by `react-router-dom`.
Each file exports a default component for the corresponding route.

## Conventions

| File           | URL                                                                 |
| -------------- | ------------------------------------------------------------------- |
| `index.tsx`    | `/`                                                                 |
| `about.tsx`    | `/about`                                                            |
| `blog.tsx`     | `/blog`                                                             |
| `contact.tsx`  | `/contact`                                                          |
| `notes.tsx`    | `/notes`                                                            |
| `now.tsx`      | `/now`                                                              |
| `projects.tsx` | `/projects`                                                         |
| `uses.tsx`     | `/uses`                                                             |
| `__root.tsx`   | app shell — wraps every page and renders children with `<Outlet />` |

The app uses `src/App.tsx` to configure the `BrowserRouter` and route tree.
