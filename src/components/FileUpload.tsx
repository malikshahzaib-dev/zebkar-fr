import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type DataType = {
  id: number;
  title: string;
};

type FormType = {
  id: number; 
  files: (File | null)[];
  mongoId?: string; 
};

export default function FileUpload() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<DataType[]>([]);
  const [filterData, setFilterData] = useState<DataType[]>([]);
  const [showList, setShowList] = useState(false);

  const [form, setForm] = useState<FormType[]>([
    { id: 1, files: [null, null, null, null, null] },
  ]);

  const addForm = () => {
    setForm([
      ...form,
      { id: Date.now(), files: [null, null, null, null, null] },
    ]);
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setData([]);
      setFilterData([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("https://zebkar.com/api/products");
        const result = await res.json();

        setData(result);

        const filtered = result.filter((item: DataType) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilterData(filtered);
      } catch (err) {
        console.error("API error to fetch data", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formIndex: number,
    fileIndex: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/webp", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only webp, jpg and png images are allowed");
      e.target.value = "";
      return;
    }

    const updatedForm = [...form];
    updatedForm[formIndex].files[fileIndex] = file;
    setForm(updatedForm);
  };

  const handleRemoveFile = (formIndex: number, fileIndex: number) => {
    const updatedForm = [...form];
    updatedForm[formIndex].files[fileIndex] = null;
    setForm(updatedForm);
  };

  const handleRemoveForm = (id: number) => {
    const updatedForm = form.filter((item) => item.id !== id);
    setForm(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (let i = 0; i < form.length; i++) {
      if (!form[i].files[0]) {
        alert(`Form ${i + 1}: Base Image is required`);
        return;
      }
    }

    try {
      const updatedForms = [...form];

      for (let i = 0; i < updatedForms.length; i++) {
        const formData = new FormData();

        formData.append("baseImage", updatedForms[i].files[0]!);

        for (let j = 1; j < updatedForms[i].files.length; j++) {
          if (updatedForms[i].files[j]) {
            formData.append("otherImages", updatedForms[i].files[j]!);
          }
        }

        const res = await fetch("http://localhost:5000/api/image", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        updatedForms[i].mongoId = result.data._id;
      }

      setForm(updatedForms);

      alert("Upload successful! Now you can click Edit.");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  return (
    <div className="container py-5">
      <div className="card p-5 shadow-lg">
        <h2 className="text-center font-bold text-primary mb-4">Zebkar</h2>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="w-50 position-relative">
            <input
              type="search"
              placeholder="Search Product..."
              className="form-control rounded-pill"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowList(true);
              }}
            />
          </div>

          <button className="btn btn-primary ms-3" onClick={addForm}>
            + Add More Forms
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {form.map((item, index) => (
            <div key={item.id} className="card p-4 mb-4 bg-light shadow-sm">
              <h5 className="text-center mb-3">
                Base Image Form {index + 1}
              </h5>

              {form.length > 1 && (
                <div className="d-flex justify-content-end mb-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveForm(item.id)}
                    className="btn btn-danger"
                  >
                    Remove Form
                  </button>
                </div>
              )}

              {item.files.map((file, fileIndex) => (
                <div key={fileIndex} className="mb-3">
                  <label className="form-label fw-semibold">
                    {fileIndex === 0
                      ? "Parent Base Image (Required)"
                      : `Child ${fileIndex} Image Optional`}
                  </label>

                  <input
                    type="file"
                    accept="image/webp, image/jpeg, image/png"
                    className="form-control"
                    onChange={(e) =>
                      handleFileChange(e, index, fileIndex)
                    }
                  />

                  {file && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (!item.mongoId) {
                    alert("Please upload this form first!");
                    return;
                  }

                  navigate(`/fileupdate/${item.mongoId}`);
                }}
              >
                Edit
              </button>
            </div>
          ))}

          <div className="text-center">
            <button type="submit" className="btn btn-success">
              Submit All Forms
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}