"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  published: boolean;
  created_at: string;
};

const categories = [
  "Weddings",
  "Portraits",
  "Pre-Wedding",
  "Editorial",
  "Commercial",
  "Events",
];

const allowedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const maxFileSize = 15 * 1024 * 1024; // 15 MB

// =========================
// IMAGE COMPRESSION
// =========================

const revokePreviewUrl = (url: string | null) => {
  if (url) {
    URL.revokeObjectURL(url);
  }
};

const compressImage = (
  file: File
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();

    const objectUrl =
      URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxDimension = 2400;

      let width = image.width;
      let height = image.height;

      // Resize while keeping aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height =
            Math.round(
              (height / width) *
                maxDimension
            );

          width = maxDimension;
        } else {
          width =
            Math.round(
              (width / height) *
                maxDimension
            );

          height = maxDimension;
        }
      }

      const canvas =
        document.createElement("canvas");

      canvas.width = width;
      canvas.height = height;

      const context =
        canvas.getContext("2d");

      if (!context) {
        reject(
          new Error(
            "Could not create image canvas."
          )
        );
        return;
      }

      // Draw image at optimized dimensions
      context.drawImage(
        image,
        0,
        0,
        width,
        height
      );

      // Convert to WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "Image compression failed."
              )
            );
            return;
          }

          const compressedFile =
            new File(
              [blob],
              `${file.name.replace(
                /\.[^/.]+$/,
                ""
              )}.webp`,
              {
                type: "image/webp",
                lastModified:
                  Date.now(),
              }
            );

          resolve(compressedFile);
        },
        "image/webp",
        0.82
      );
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);

      reject(
        new Error(
          "Could not process this image."
        )
      );
    };

    image.src = objectUrl;
  });
};

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [portfolioCount, setPortfolioCount] = useState(0);

  const [portfolioItems, setPortfolioItems] = useState<
    PortfolioItem[]
  >([]);

  // Upload
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Weddings");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const fileInputRef =
  useRef<HTMLInputElement>(null);

  const [published, setPublished] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Drag and drop
  const [isDragging, setIsDragging] =
    useState(false);

  // Upload feedback
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  const [uploadMessage, setUploadMessage] =
    useState("");

  // Edit
  const [editingId, setEditingId] =
    useState<string | null>(null);
  const [editingTitle, setEditingTitle] =
    useState("");
  const [editingCategory, setEditingCategory] =
    useState("Weddings");

  // =========================
  // LOAD PORTFOLIO
  // =========================

  useEffect(() => {
    const loadPortfolio = async () => {
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error fetching portfolio:",
          error
        );
        return;
      }

      const items = data || [];

      setPortfolioItems(items);

      const publishedCount = items.filter(
        (item) => item.published
      ).length;

      setPortfolioCount(publishedCount);
    };

    loadPortfolio();
  }, []);

  // =========================
  // IMAGE PREVIEW + VALIDATION
  // =========================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0] || null;

    // Clear previous feedback
    setUploadStatus("idle");
    setUploadMessage("");

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Check file type
    if (
      !allowedFileTypes.includes(
        selectedFile.type
      )
    ) {
      alert(
        "Invalid file type. Please select a JPG, JPEG, PNG, or WEBP image."
      );

      event.target.value = "";
      setFile(null);
      setPreviewUrl(null);

      return;
    }

    // Check file size
    if (selectedFile.size > maxFileSize) {
      alert(
        "Image is too large. Please select an image smaller than 15 MB."
      );

      event.target.value = "";
      setFile(null);
      setPreviewUrl(null);

      return;
    }

    // File is valid
    setFile(selectedFile);

    revokePreviewUrl(previewUrl);

    const url =
      URL.createObjectURL(selectedFile);

    setPreviewUrl(url);
  };

  // =========================
  // DRAG AND DROP
  // =========================

  const handleDragOver = (
    event: React.DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);
  };

  const handleDragLeave = (
    event: React.DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLLabelElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);

    const droppedFile =
      event.dataTransfer.files?.[0] || null;

    // Clear previous feedback
    setUploadStatus("idle");
    setUploadMessage("");

    if (!droppedFile) {
      return;
    }

    // Check file type
    if (
      !allowedFileTypes.includes(
        droppedFile.type
      )
    ) {
      alert(
        "Invalid file type. Please select a JPG, JPEG, PNG, or WEBP image."
      );

      setFile(null);
      setPreviewUrl(null);

      return;
    }

    // Check file size
    if (droppedFile.size > maxFileSize) {
      alert(
        "Image is too large. Please select an image smaller than 15 MB."
      );

      setFile(null);
      setPreviewUrl(null);

      return;
    }

    // File is valid
    setFile(droppedFile);

    revokePreviewUrl(previewUrl);

    const url =
      URL.createObjectURL(droppedFile);

    setPreviewUrl(url);
  };

  // =========================
  // UPLOAD PHOTO
  // =========================

  const handleUpload = async () => {
    // Prevent accidental second upload
    if (uploading) {
      return;
    }

    // Reset previous feedback
    setUploadStatus("idle");
    setUploadMessage("");

    // Check file
    if (!file) {
      setUploadStatus("error");
      setUploadMessage(
        "Please select a photo before uploading."
      );
      return;
    }

    // Check title
    if (!title.trim()) {
      setUploadStatus("error");
      setUploadMessage(
        "Please enter a title for the photo."
      );
      return;
    }

    // Check file type again before upload
    if (
      !allowedFileTypes.includes(
        file.type
      )
    ) {
      setUploadStatus("error");
      setUploadMessage(
        "Invalid file type. Please select a JPG, PNG, or WEBP image."
      );
      return;
    }

    // Check file size again before upload
    if (file.size > maxFileSize) {
      setUploadStatus("error");
      setUploadMessage(
        "Image is too large. Please select an image smaller than 15 MB."
      );
      return;
    }

    setUploading(true);
    setUploadStatus("uploading");
    setUploadMessage(
      "Optimizing your photograph..."
    );

    try {
      // =========================
      // COMPRESS IMAGE
      // =========================

      const compressedFile =
        await compressImage(file);



      // =========================
      // UPLOAD OPTIMIZED IMAGE
      // =========================

      setUploadMessage(
        "Uploading your photograph..."
      );

      const fileName = `${Date.now()}-${compressedFile.name}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from("portfolio")
        .upload(
          fileName,
          compressedFile
        );

      if (uploadError) {
        console.error(
          "Upload error:",
          uploadError
        );

        setUploadStatus("error");
        setUploadMessage(
          `Photo upload failed: ${uploadError.message}`
        );

        return;
      }

      // =========================
      // GET PUBLIC URL
      // =========================

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("portfolio")
        .getPublicUrl(fileName);

      const imageUrl =
        publicUrlData.publicUrl;

      // =========================
      // SAVE DATABASE RECORD
      // =========================

      const {
        error: databaseError,
      } = await supabase
        .from("portfolio")
        .insert({
          title: title.trim(),
          category,
          image_url: imageUrl,
          published,
        });

      if (databaseError) {
        console.error(
          "Database error:",
          databaseError
        );

        // Remove uploaded image if
        // database entry failed
        await supabase.storage
          .from("portfolio")
          .remove([fileName]);

        setUploadStatus("error");
        setUploadMessage(
          `Photo uploaded, but the database entry failed: ${databaseError.message}`
        );

        return;
      }

      // =========================
      // SUCCESS
      // =========================

      setUploadStatus("success");
      setUploadMessage(
        "Photo optimized and uploaded successfully!"
      );

      // Reset form
      setTitle("");
      setCategory("Weddings");
      setFile(null);
      setPreviewUrl(null);
      setPublished(true);

      // Reload after showing success
      setTimeout(() => {
        window.location.reload();
      }, 900);

    } catch (error) {
      console.error(
        "Unexpected upload error:",
        error
      );

      setUploadStatus("error");

      if (error instanceof Error) {
        setUploadMessage(
          `Something went wrong: ${error.message}`
        );
      } else {
        setUploadMessage(
          "Something went wrong while optimizing the photo."
        );
      }

    } finally {
      setUploading(false);
    }
  };

  // =========================
  // START EDITING
  // =========================

  const startEditing = (
    item: PortfolioItem
  ) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
    setEditingCategory(item.category);
  };

  // =========================
  // CANCEL EDITING
  // =========================

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingCategory("Weddings");
  };

  // =========================
  // SAVE EDIT
  // =========================

  const saveEdit = async (
    item: PortfolioItem
  ) => {
    if (!editingTitle.trim()) {
      alert("Title cannot be empty.");
      return;
    }

    const { error } = await supabase
      .from("portfolio")
      .update({
        title: editingTitle.trim(),
        category: editingCategory,
      })
      .eq("id", item.id);

    if (error) {
      console.error(
        "Edit update error:",
        error.message
      );

      alert("Failed to update photo.");
      return;
    }

    setPortfolioItems(
      (currentItems) =>
        currentItems.map(
          (portfolioItem) =>
            portfolioItem.id === item.id
              ? {
                  ...portfolioItem,
                  title:
                    editingTitle.trim(),
                  category:
                    editingCategory,
                }
              : portfolioItem
        )
    );

    cancelEditing();

    alert(
      "Photo updated successfully!"
    );
  };

  // =========================
  // PUBLISH / UNPUBLISH
  // =========================

  const togglePublished = async (
    item: PortfolioItem
  ) => {
    const newStatus = !item.published;

    const { error } = await supabase
      .from("portfolio")
      .update({
        published: newStatus,
      })
      .eq("id", item.id);

    if (error) {
      console.error(
        "Publish update error:",
        error.message
      );

      alert(
        "Failed to update photo status."
      );

      return;
    }

    setPortfolioItems(
      (currentItems) =>
        currentItems.map(
          (portfolioItem) =>
            portfolioItem.id === item.id
              ? {
                  ...portfolioItem,
                  published: newStatus,
                }
              : portfolioItem
        )
    );

    setPortfolioCount(
      (currentCount) =>
        newStatus
          ? currentCount + 1
          : Math.max(
              currentCount - 1,
              0
            )
    );
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error.message
      );

      alert("Failed to log out.");
      return;
    }

    router.push("/login");
    router.refresh();
  };

  // =========================
  // DELETE PHOTO
  // =========================

  const deletePhoto = async (
    item: PortfolioItem
  ) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      /*
        Extract the Storage path from the
        public Supabase image URL.
      */

      const marker =
        "/storage/v1/object/public/portfolio/";

      const markerIndex =
        item.image_url.indexOf(marker);

      if (markerIndex === -1) {
        console.error(
          "Invalid portfolio image URL:",
          item.image_url
        );

        alert(
          "Could not find the storage file."
        );

        return;
      }

      const encodedPath =
        item.image_url.substring(
          markerIndex + marker.length
        );

      const storagePath =
        decodeURIComponent(encodedPath);


      // Check authenticated user
      const {
        data: {
          user,
        },
      } = await supabase.auth.getUser();


      if (!user) {
        alert(
          "You are not authenticated."
        );

        router.push("/login");
        return;
      }

      /*
        Delete the image from Supabase Storage.
      */

      const {
        data: storageData,
        error: storageError,
      } = await supabase.storage
        .from("portfolio")
        .remove([storagePath]);


      if (storageError) {
        console.error(
          "Storage delete error:",
          storageError
        );

        alert(
          `Storage deletion failed: ${storageError.message}`
        );

        return;
      }

      /*
        IMPORTANT:
        Supabase returning an empty array means
        we should NOT delete the database row yet.
      */

      if (
        !storageData ||
        storageData.length === 0
      ) {
        console.warn(
          "Storage deletion returned no deleted objects."
        );

        alert(
          "Supabase did not confirm that the image was deleted from Storage."
        );

        return;
      }

      /*
        Only after Storage deletion succeeds,
        delete the database record.
      */

      const {
        error: databaseError,
      } = await supabase
        .from("portfolio")
        .delete()
        .eq("id", item.id);

      if (databaseError) {
        console.error(
          "Database delete error:",
          databaseError
        );

        alert(
          "Image was deleted from Storage, but the database entry could not be deleted."
        );

        return;
      }

      /*
        Update the UI.
      */

      setPortfolioItems(
        (currentItems) =>
          currentItems.filter(
            (portfolioItem) =>
              portfolioItem.id !== item.id
          )
      );

      if (item.published) {
        setPortfolioCount(
          (currentCount) =>
            Math.max(
              currentCount - 1,
              0
            )
        );
      }

      alert(
        "Photo deleted successfully!"
      );

    } catch (error) {
      console.error(
        "Unexpected delete error:",
        error
      );

      alert(
        "Something went wrong while deleting the photo."
      );
    }
  };

  // Number of categories actually being used
  const activeCategories = new Set(
    portfolioItems.map(
      (item) => item.category
    )
  ).size;

  return (
    <main className="admin">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="admin-sidebar">

        <div className="admin-brand">

          <div className="admin-brand-title">
            PRAVIN
          </div>

          <div className="admin-brand-subtitle">
            PHOTO STUDIO
          </div>

        </div>

        <nav className="admin-nav">

          <a
            href="/admin"
            className="admin-nav-link active"
          >
            <span className="nav-icon">
              ▦
            </span>
            Dashboard
          </a>

          <a
            href="#portfolio"
            className="admin-nav-link"
          >
            <span className="nav-icon">
              ▧
            </span>
            Portfolio
          </a>

          <a
            href="#upload"
            className="admin-nav-link"
          >
            <span className="nav-icon">
              ↑
            </span>
            Upload Photo
          </a>

        </nav>

        <div className="admin-owner">

          <div className="owner-avatar">
            PS
          </div>

          <div className="owner-info">

            <strong>
              Pravin Studio
            </strong>

            <span>
              Owner
            </span>

          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            aria-label="Log out"
          >
            ↪
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <section className="admin-content">

        {/* HEADER */}

        <header className="admin-header">

          <div>

            <span className="admin-eyebrow">
              OWNER DASHBOARD
            </span>

            <h1>
              Welcome back.
            </h1>

            <p>
              Manage your photography portfolio
              from one place.
            </p>

          </div>

          <div className="admin-date">

            <span>
              ◷
            </span>

            {new Date().toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )}

          </div>

        </header>

        {/* =========================
            STAT CARDS
        ========================= */}

        <div className="admin-cards">

          <div className="admin-card">

            <div className="stat-icon">
              ▧
            </div>

            <div className="stat-content">

              <span>
                PUBLISHED PHOTOS
              </span>

              <h2>
                {portfolioCount}
              </h2>

              <p>
                Live on website
              </p>

            </div>

          </div>

          <div className="admin-card">

            <div className="stat-icon">
              ◇
            </div>

            <div className="stat-content">

              <span>
                CATEGORIES
              </span>

              <h2>
                {activeCategories}
              </h2>

              <p>
                Active categories
              </p>

            </div>

          </div>

          <div className="admin-card">

            <div className="stat-icon">
              ◉
            </div>

            <div className="stat-content">

              <span>
                WEBSITE STATUS
              </span>

              <h2 className="status-ready">
                READY
              </h2>

              <p>
                Website is online
              </p>

            </div>

          </div>

        </div>

        {/* =========================
            UPLOAD
        ========================= */}

        <section
          className="admin-panel"
          id="upload"
        >

          <div className="panel-heading">

            <div>

              <span>
                PORTFOLIO
              </span>

              <h2>
                Upload a new photo
              </h2>

              <p>
                Add a photograph to your public portfolio.
              </p>

            </div>

          </div>

          <div className="upload-form">

            {/* PHOTO */}

            <div className="upload-field">

              <label>
                Photo
              </label>

              <label
                htmlFor="photo-upload"
                className={`upload-dropzone ${
                  isDragging
                    ? "dragging"
                    : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >

                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Selected photo preview"
                    className="upload-preview"
                  />
                ) : (
                  <>
                    <span className="upload-icon">
                      ↑
                    </span>

                    <strong>
                      Click to upload or drag & drop
                    </strong>

                    <span>
                      JPG, PNG, WEBP • Max 15 MB
                    </span>
                  </>
                )}

              </label>


              {previewUrl && (
  <button
    type="button"
    className="remove-photo-button"
    onClick={() => {
      revokePreviewUrl(previewUrl);
      setFile(null);
      setPreviewUrl(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }}
  >
    Remove photo
  </button>
)}

              <input
                ref={fileInputRef}
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden-file-input"
                onChange={handleFileChange}
              />

            </div>

            {/* TITLE */}

            <div className="upload-field">

              <label htmlFor="title">
                Title
              </label>

              <input
                id="title"
                type="text"
                placeholder="A moment to remember"
                value={title}
                onChange={(event) => {
                  setTitle(
                    event.target.value
                  );

                  if (
                    uploadStatus ===
                    "error"
                  ) {
                    setUploadStatus("idle");
                    setUploadMessage("");
                  }
                }}
              />

            </div>

            {/* CATEGORY */}

            <div className="upload-field">

              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) => {
                  setCategory(
                    event.target.value
                  );
                }}
              >

                {categories.map(
                  (item) => (
                    <option
                      value={item}
                      key={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* PUBLISH */}

            <div className="upload-field publish-field">

              <label>
                Publish immediately
              </label>

              <label className="publish-toggle">

                <input
                  type="checkbox"
                  checked={published}
                  onChange={(event) => {
                    setPublished(
                      event.target.checked
                    );
                  }}
                />

                <span className="toggle-slider" />

                <span>
                  Yes, publish this photo
                </span>

              </label>

            </div>

          </div>

          {/* =========================
              UPLOAD FEEDBACK
          ========================= */}

          {uploadStatus !== "idle" && (
            <div
              className={`upload-feedback ${uploadStatus}`}
              role={
                uploadStatus === "error"
                  ? "alert"
                  : "status"
              }
            >

              {uploadStatus ===
                "uploading" && (
                <span className="feedback-spinner" />
              )}

              {uploadStatus ===
                "success" && (
                <span className="feedback-icon">
                  ✓
                </span>
              )}

              {uploadStatus ===
                "error" && (
                <span className="feedback-icon">
                  !
                </span>
              )}

              <span>
                {uploadMessage}
              </span>

            </div>
          )}

          <button
            type="button"
            className="upload-button"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading
              ? "Uploading..."
              : "↑  Upload Photo"}
          </button>

        </section>

        {/* =========================
            PORTFOLIO
        ========================= */}

        <section
          className="admin-panel portfolio-panel"
          id="portfolio"
        >

          <div className="panel-heading">

            <div>

              <span>
                YOUR PORTFOLIO
              </span>

              <h2>
                Uploaded photos
              </h2>

              <p>
                Manage the photographs currently
                displayed on your website.
              </p>

            </div>

          </div>

          <div className="admin-portfolio-grid">

            {portfolioItems.map(
              (item) => (

                <article
                  className="admin-portfolio-item"
                  key={item.id}
                >

                  {/* IMAGE */}

                  <div className="admin-portfolio-image">

                    <img
                      src={item.image_url}
                      alt={item.title}
                    />

                  </div>

                  {/* CONTENT */}

                  {editingId === item.id ? (

                    <div className="admin-portfolio-info edit-mode">

                      <select
                        value={editingCategory}
                        onChange={(event) => {
                          setEditingCategory(
                            event.target.value
                          );
                        }}
                      >

                        {categories.map(
                          (categoryItem) => (
                            <option
                              key={
                                categoryItem
                              }
                              value={
                                categoryItem
                              }
                            >
                              {
                                categoryItem
                              }
                            </option>
                          )
                        )}

                      </select>

                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(event) => {
                          setEditingTitle(
                            event.target.value
                          );
                        }}
                      />

                      <div className="edit-actions">

                        <button
                          type="button"
                          className="save-button"
                          onClick={() =>
                            saveEdit(item)
                          }
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          className="cancel-button"
                          onClick={
                            cancelEditing
                          }
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    <div className="admin-portfolio-info">

                      <span className="portfolio-category">
                        {item.category}
                      </span>

                      <h3>
                        {item.title}
                      </h3>

                      <p
                        className={
                          item.published
                            ? "published-status"
                            : "unpublished-status"
                        }
                      >
                        {item.published
                          ? "Published"
                          : "Unpublished"}
                      </p>

                      {/* PUBLISH BUTTON */}

                      <button
                        type="button"
                        className="portfolio-publish-button"
                        onClick={() =>
                          togglePublished(
                            item
                          )
                        }
                      >
                        {item.published
                          ? "◉  Unpublish"
                          : "○  Publish"}
                      </button>

                      {/* EDIT + DELETE */}

                      <div className="portfolio-actions">

                        <button
                          type="button"
                          className="portfolio-edit-button"
                          onClick={() =>
                            startEditing(
                              item
                            )
                          }
                        >
                          ✎ &nbsp; Edit
                        </button>

                        <button
                          type="button"
                          className="portfolio-delete-button"
                          onClick={() =>
                            deletePhoto(
                              item
                            )
                          }
                        >
                          × &nbsp; Delete
                        </button>

                      </div>

                    </div>

                  )}

                </article>

              )
            )}

          </div>

          {portfolioItems.length === 0 && (

            <div className="portfolio-empty">

              <span>
                No photos yet
              </span>

              <p>
                Upload your first photograph
                above to start building your portfolio.
              </p>

            </div>

          )}

        </section>

      </section>

    </main>
  );
}