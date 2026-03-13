import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type FileData = {
  _id: string;
  title: string;
  baseImage: string;
  childImages: string[];
};

export default function FileUpdate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [baseImage, setBaseImage] = useState<File | string | null>(null);
  const [childImages, setChildImages] = useState<(File | string | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  useEffect(() => {
    if (!id) return;

    const fetchFile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/image/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch file");
        }

        const data: FileData = await res.json();

        setTitle(data.title);

        // ✅ Fix image URL path
        setBaseImage(`http://localhost:5000/${data.baseImage}`);

        setChildImages([
          data.childImages[0]
            ? `http://localhost:5000/${data.childImages[0]}`
            : null,
          data.childImages[1]
            ? `http://localhost:5000/${data.childImages[1]}`
            : null,
          data.childImages[2]
            ? `http://localhost:5000/${data.childImages[2]}`
            : null,
          data.childImages[3]
            ? `http://localhost:5000/${data.childImages[3]}`
            : null,
        ]);
      } catch (err) {
        console.error("Error fetching file:", err);
      }
    };

    fetchFile();
  }, [id]);

  const handleBaseImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) setBaseImage(file);
  };

  const handleChildImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = [...childImages];
      updated[index] = file;
      setChildImages(updated);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);

    if (baseImage instanceof File) {
      formData.append("baseImage", baseImage);
    }

    childImages.forEach((img) => {
      if (img instanceof File) {
        formData.append("otherImages", img);
      }
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/image/${id}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Update failed");
      }

      await res.json();

      alert("File updated successfully!");
      navigate("/");
    } catch (err) {
      console.error("Update error:", err);
      alert("Something went wrong while updating");
    }
  };

  return (
    <div className="container py-5">
      <div className="card p-5 shadow-lg">
        <h2 className="text-center font-bold text-primary mb-4">
          Update File
        </h2>

        <form onSubmit={handleUpdate}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Base Image */}
          <div className="mb-3">
            <label className="form-label">
              Base Image (Optional)
            </label>

            {baseImage && typeof baseImage === "string" && (
              <img
                src={baseImage}
                alt="base preview"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            )}

            <input
              type="file"
              className="form-control mt-2"
              onChange={handleBaseImageChange}
            />
          </div>

          {childImages.map((img, index) => (
            <div key={index} className="mb-3">
              <label className="form-label">
                Child Image {index + 1} (Optional)
              </label>

              {img && typeof img === "string" && (
                <img
                  src={img}
                  alt={`child ${index + 1}`}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 6,
                  }}
                />
              )}

              <input
                type="file"
                className="form-control mt-2"
                onChange={(e) =>
                  handleChildImageChange(e, index)
                }
              />
            </div>
          ))}

          <div className="text-center mt-3">
            <button type="submit" className="btn btn-success">
              Update File
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}