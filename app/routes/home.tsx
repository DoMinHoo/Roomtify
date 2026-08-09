import { ArrowRight, ArrowUp, ArrowUpRight, Clock, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Navbar from "../../components/ui/Navbar";
import type { Route } from "./+types/home";
import { Button } from "../../components/ui/Button";
import Upload from "../../components/Upload";
import { useNavigate } from "react-router";
import { createProject, getProjects } from "../../lib/putter.action";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {

  const navigate = useNavigate()
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const isCreatingPrjectRef = useRef(false)


  const handleUploadComplete = async (base64: string) => {
    try {
      if (isCreatingPrjectRef.current) return false;
      isCreatingPrjectRef.current = true;
      const newId = Date.now().toString(); // Generate a unique ID based on the current timestamp
      const name = `Residence ${newId}`;

      const newItem = {
        id: newId,
        name,
        sourceImage: base64,
        renderedImage: undefined,
        timestamp: Date.now()
      }

      const saved = await createProject({ item: newItem, visibility: 'private' });

      if (!saved) {
        console.error("Failed to create project");
        return false;
      }

      setProjects((prev) => [saved, ...prev]);


      navigate(`/visualizer/${newId}`, {
        state: {
          initialImage: saved.sourceImage,
          initialRendered: saved.renderedImage || null,
          name
        }
      });

      return true;
    } finally {
      isCreatingPrjectRef.current = false;
    }

  }

  useEffect(() => {
    const fetchProjects = async () => {
      const items = await getProjects();

      setProjects(items);
    }
    fetchProjects();
  }, []);

  return (
    <div className="home">
      <Navbar />
      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse">
            </div>
          </div>
          <p>Introducing Roomtify 2.0</p>
        </div>

        <h1>Built beautiful spaces at the speed of thought with Roomtify</h1>

        <p className="subtitle">Roomtify is an AI-first design enviroment that helps you visualize, render, and ship, architectural projects faster than ever.</p>

        <div className="actions">
          <a href="#upload" className="cta">
            Get Started <ArrowRight className="icon" />
          </a>

          <Button variant="secondary" size="lg" className="demo">Watch Demo</Button>
        </div>

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />

          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>Upload Your Floor Design</h3>
              <p>Upload your floor design and let Roomtify do the rest. Our AI will generate a stunning 3D model of your space in seconds.</p>
            </div>

            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>


      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>Your lastest work and shared community projiect, all in one place</p>
            </div>
          </div>

          <div className="projects-grid">
            {projects.map(({ id, name, sourceImage, renderedImage, timestamp }) => (
              <div key={id} className="project-card group" onClick={() => navigate(`/visualizer/${id}`)}>
                <div className="preview">
                  <img
                    src={renderedImage || sourceImage || sourceImage}
                    alt="Project"
                  />

                  <div className="badge">
                    <span>Community</span>
                  </div>
                </div>
                <div className="card-body">
                  <div>
                    <h3>{name}</h3>

                    <div className="meta">
                      <Clock size={12} />
                      <span>{new Date(timestamp).toLocaleDateString()}</span>
                      <span>By HaDu</span>
                    </div>
                  </div>

                  <div className="arrow">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section >
    </div >
  )
}
