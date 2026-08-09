import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router";
import { generate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { createProject, getProjectById } from "../../lib/putter.action";

const visualizerId = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { userId } = useOutletContext<AuthContext>();


    const hasInitialGenerated = useRef(false);

    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    const handleBack = () => navigate('/')

    const [generationError, setGenerationError] = useState<string | null>(null);

    const runGeneration = async (item: DesignItem) => {
        if (!id || !item.sourceImage) return;

        try {
            setGenerationError(null);
            setIsProcessing(true);
            const result = await generate3DView({ sourceImage: item.sourceImage });

            if (result.renderedImage) {
                setCurrentImage(result.renderedImage);

                const updateItem = {
                    ...item,
                    renderedImage: result.renderedImage,
                    renderedPath: result.renderedPath,
                    timestamp: Date.now(),
                    ownerId: item.ownerId ?? userId ?? null,
                    isPublic: item.isPublic ?? false,
                }

                const saved = await createProject({ item: updateItem, visibility: "private" })

                if (!saved) {
                    throw new Error("Failed to persist generated project");
                }

                setProject(saved);
                setCurrentImage(saved.renderedImage || result.renderedImage);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("Generation false: ", error);
            setGenerationError(message);
        } finally {
            setIsProcessing(false);
        }
    }
    useEffect(() => {
        let isMounted = true;

        const loadProject = async () => {
            if (!id) {
                setIsProjectLoading(false);
                return;
            }

            setIsProjectLoading(true);

            const fetchedProject = await getProjectById({ id });

            if (!isMounted) return;

            setProject(fetchedProject);
            setCurrentImage(fetchedProject?.renderedImage || null);
            setIsProjectLoading(false);
            hasInitialGenerated.current = false;
        };

        loadProject();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (
            isProjectLoading ||
            hasInitialGenerated.current ||
            !project?.sourceImage
        )
            return;

        if (project.renderedImage) {
            setCurrentImage(project.renderedImage);
            hasInitialGenerated.current = true;
            return;
        }

        hasInitialGenerated.current = true;
        void runGeneration(project);
    }, [project, isProjectLoading]);
    return (
        <section>
            <div className="visualizer">
                <nav className="topbar">
                    <div className="brand">
                        <Box className='logo' />
                        <span className='name'>Roomtify</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                        <X className="icon" /> Exit
                    </Button>
                </nav>
                <section className="content">
                    <div className="panel">
                        <div className="panel-header">
                            <div className="panel-meta">
                                <p>Project</p>
                                <h2>{project?.name || `Residence ${id}`}</h2>
                                <p className="note">Create by you</p>
                            </div>

                            <div className="panel-action">
                                <Button size="sm"
                                    onClick={() => { }}
                                    className="export"
                                    disabled={!currentImage}>
                                    <Download className="w-4 h-4 me-2" />Export
                                </Button>
                                <Button size="sm"
                                    onClick={() => { }}
                                    className="share bg-black"
                                >
                                    <Share2 className="w-4 h-4 me-2" />Share
                                </Button>
                            </div>
                        </div>

                        <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
                            {currentImage ? (
                                <img src={currentImage} alt="AI Render" className="render-img" />
                            ) : (
                                <div className="render-placeholder">
                                    {project?.sourceImage && (
                                        <img src={project?.sourceImage} alt="Original" className="render-fallback" />
                                    )}
                                </div>
                            )}

                            {isProcessing && (
                                <div className="render-overlay">
                                    <RefreshCcw className="spinner" />
                                    <span className="title">Rendering...</span>
                                    <span className="subtile">Generating your 3D visualization...</span>
                                </div>
                            )}
                            {generationError && (
                                <div className="render-error">
                                    <p>{generationError}</p>
                                </div>
                            )}
                        </div>
                    </div>

                </section>
            </div >
        </section >
    )
}

export default visualizerId