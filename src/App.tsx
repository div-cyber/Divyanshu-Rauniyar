import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RootLayout } from "./routes/__root";
import AboutPage from "./routes/about";
import AdminPage from "./routes/admin";
import BlogPage from "./routes/blog";
import ContactPage from "./routes/contact";
import IndexPage from "./routes/index";
import NotesPage from "./routes/notes";
import NowPage from "./routes/now";
import ProjectsPage from "./routes/projects";
import UsesPage from "./routes/uses";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-24 text-center">
      <div className="max-w-xl">
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The page you are looking for does not exist.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<IndexPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="now" element={<NowPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="uses" element={<UsesPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
