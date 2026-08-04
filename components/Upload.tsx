import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useState } from 'react'
import { useOutletContext } from 'react-router';
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../lib/constans';

type UploadProps = {
    onComplete?: (base64: string) => void;
};

const Upload: React.FC<UploadProps> = ({ onComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = (f: File | null) => {
        if (!f) return;
        if (!isSignedIn) return; // block upload logic if not signed in

        setFile(f);
        setProgress(0);

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = String(reader.result || '');

            let accumulated = 0;
            const interval = window.setInterval(() => {
                accumulated = Math.min(100, accumulated + PROGRESS_STEP);
                setProgress(accumulated);

                if (accumulated >= 100) {
                    clearInterval(interval);
                    // Delay the final onComplete to allow UI to show "complete" state
                    window.setTimeout(() => {
                        if (onComplete) onComplete(base64);
                    }, REDIRECT_DELAY_MS);
                }
            }, PROGRESS_INTERVAL_MS);
        };

        reader.readAsDataURL(f);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (!isSignedIn) return;

        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
            const f = dt.files[0];
            processFile(f);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null;
        if (!f) return;
        processFile(f);
        // reset the input so the same file can be selected again if needed
        e.currentTarget.value = '';
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? 'is-dragging' : ''} ${!isSignedIn ? 'disabled' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={handleInputChange}
                        aria-disabled={!isSignedIn}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? (
                                "Drag and drop your floor design here, or click to select a file."
                            ) : ("Sign in or sign up with Puter to upload")}
                        </p>
                        <p className="help">Maximum file size 50MB.</p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className='status-icon'>
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ) : (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />

                            <p className="statsus-text">
                                {progress < 100 ? 'Analyzing your design...' : 'Redirecting to your 3D model...'}
                            </p>
                        </div>
                    </div>
                </div>
            )
            }

        </div >
    )
}

export default Upload