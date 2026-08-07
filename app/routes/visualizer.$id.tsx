import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { generate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import { Button } from "../../components/ui/Button";

const visualizerId = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { initialImage, initialRendered, name = "Untitled Project" } = location.state || {};

    const hasInitialGenerated = useRef(false)

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(initialRendered || null);

    const handleBack = () => navigate('/')

    const runGeneration = async () => {
        if (!initialImage) return;

        try {
            setIsProcessing(true);
            const result = await generate3DView({ sourceImage: initialImage });

            if (result.renderedImage) {
                setCurrentImage(result.renderedImage);
            }
        } catch (error) {
            console.error("Generation false: ", error);
        } finally {
            setIsProcessing(false);
        }
    }

    useEffect(() => {
        if (!initialImage || hasInitialGenerated.current) return;

        if (initialRendered) {
            setCurrentImage(initialRendered);
            hasInitialGenerated.current = true;
            return;
        }
        hasInitialGenerated.current = true;
        runGeneration();
    }, [initialImage, initialRendered])

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
                                <h2>{'Untitled Project'}</h2>
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
                                    {initialImage && (
                                        <img src={initialImage} alt="Original" className="render-fallback" />
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
                        </div>
                    </div>

                </section>
            </div >
        </section >
    )
}

export default visualizerId