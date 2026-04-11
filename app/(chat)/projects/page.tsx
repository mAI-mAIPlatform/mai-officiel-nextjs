import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ProjectCard } from "@/components/projects/project-card";
import { getProjects } from "@/lib/db/queries";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const projects = await getProjects(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 text-white md:px-6">
      <section className="liquid-panel rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Projets</h1>
            <p className="text-sm text-white/70">
              Isolez conversations, sources, mémoire et tâches par contexte.
            </p>
          </div>

          <Link
            className="rounded-xl border border-cyan-300/40 bg-cyan-400/20 px-4 py-2 text-sm font-medium text-cyan-50"
            href="/projects/new"
          >
            Nouveau projet
          </Link>
        </div>
      </section>

      {projects.length === 0 ? (
        <section className="liquid-panel rounded-2xl border border-white/20 bg-white/5 p-8 text-sm text-white/75 backdrop-blur-2xl">
          Aucun projet pour le moment. Créez votre premier projet pour
          structurer vos données.
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={{
                id: project.id,
                name: project.name,
                instructions: project.instructions,
                createdAt: project.createdAt.toISOString(),
              }}
            />
          ))}
        </section>
      )}
    </main>
  );
}
