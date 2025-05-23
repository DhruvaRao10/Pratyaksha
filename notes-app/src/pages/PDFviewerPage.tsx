import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import axiosClient from "../services/axiosInstance";

// Worker configuration (using CDN as recommended before)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


// --- Optional: Basic styling for page separation ---
const pageStyle = {
  marginBottom: '10px', // Add some space between pages
  // Add border or box-shadow for clearer page separation if desired
  // border: '1px solid #ddd',
  // boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
};

export function PDFViewerPage() {
  const { docId } = useParams<{ docId: string }>();
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [numPages, setNumPages] = useState(0);
  // const [currentPage, setCurrentPage] = useState(1); // No longer needed
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      console.log(`PDF loaded successfully with ${numPages} pages.`);
      setNumPages(numPages);
      // setCurrentPage(1); // No longer needed
      setError(null);
    },
    []
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error("Failed to load PDF document:", error);
    setError(`Failed to load PDF document: ${error.message}`);
    setPdfUrl("");
    setNumPages(0);
  }, []);


  useEffect(() => {
    setPdfUrl("");
    setNumPages(0);
    // setCurrentPage(1); // No longer needed
    setError(null);

    if (!docId) {
        setError("No document ID provided.");
        return;
    }

    let isMounted = true;

    (async () => {
      console.log(`Workspaceing PDF URL for docId: ${docId}`);
      try {
        const { data } = await axiosClient.get<{ url: string }>(
          `/pdf/${docId}/url`
        );
        if (isMounted) {
          console.log(`Received PDF URL: ${data.url}`);
          setPdfUrl(data.url);
        }
      } catch (err) {
        console.error("Failed to fetch PDF URL:", err);
        if (isMounted) {
          setError("Failed to load PDF URL");
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [docId]);


  let content;
  if (error) {
    content = <div>Error: {error}</div>;
  } else if (!pdfUrl) {
    content = <div>Loading PDF URL...</div>;
  } else {
    content = (
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div>Loading PDF document...</div>}
      >
        {/* --- CHANGE: Loop through pages and render each one --- */}
        {Array.from(new Array(numPages), (el, index) => (
          <div key={`page_container_${index + 1}`} style={pageStyle}> {/* Optional container for styling */}
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              renderTextLayer={false} 
              renderAnnotationLayer={true} 
            />
          </div>
        ))}
        {numPages === 0 && <div>The document has no pages.</div>}
      </Document>
    );
  }

  return (
    <div>
      {pdfUrl && (
          <button onClick={() => window.open(pdfUrl, "_blank")} style={{ marginBottom: '10px', marginRight: '10px' }}>
             Open Raw PDF
          </button>
      )}

      <div style={{ border: '1px solid #ccc', marginBottom: '10px', maxHeight: '80vh', overflowY: 'auto' }}> 
        {content}
      </div>

    </div>
  );
}