import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Save,
  Star,
  ExternalLink,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import "./Charities.css";

const BUCKET_NAME = "charities";

const initialForm = {
  name: "",
  description: "",
  category: "",
  website_url: "",
  featured: false,
  active: true,
};

const Charities = () => {
  const [charities, setCharities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);

  // Form
  const [form, setForm] = useState(initialForm);

  // Image
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | LOAD CHARITIES
  |--------------------------------------------------------------------------
  */

  const loadCharities = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Admin session not found.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/charities`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load charities."
        );
      }

      setCharities(result.charities || []);
    } catch (error) {
      console.error(
        "Load charities error:",
        error
      );

      setError(
        error.message ||
          "Failed to load charities."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN ADD MODAL
  |--------------------------------------------------------------------------
  */

  const openAddModal = () => {
    setEditingCharity(null);
    setForm(initialForm);

    setSelectedImage(null);
    setImagePreview("");

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT MODAL
  |--------------------------------------------------------------------------
  */

  const openEditModal = (charity) => {
    setEditingCharity(charity);

    setForm({
      name: charity.name || "",
      description: charity.description || "",
      category: charity.category || "",
      website_url: charity.website_url || "",
      featured: Boolean(charity.featured),
      active:
        typeof charity.active === "boolean"
          ? charity.active
          : true,
    });

    setSelectedImage(null);
    setImagePreview(charity.image_url || "");

    setError("");
    setSuccess("");

    setShowModal(true);
  };

  /*
  |--------------------------------------------------------------------------
  | CLOSE MODAL
  |--------------------------------------------------------------------------
  */

  const closeModal = () => {
    if (saving || uploadingImage) return;

    setShowModal(false);
    setEditingCharity(null);

    setForm(initialForm);

    setSelectedImage(null);
    setImagePreview("");

    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((currentForm) => ({
      ...currentForm,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | IMAGE SELECT
  |--------------------------------------------------------------------------
  */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size must be less than 5MB."
      );

      event.target.value = "";
      return;
    }

    // Supported image formats
    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );

      event.target.value = "";
      return;
    }

    setSelectedImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  /*
  |--------------------------------------------------------------------------
  | UPLOAD IMAGE TO SUPABASE STORAGE
  |--------------------------------------------------------------------------
  */

  const uploadImage = async (file) => {
    if (!file) return null;

    try {
      setUploadingImage(true);

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const filePath =
        `admin/${crypto.randomUUID()}.${extension}`;

      const {
        error: uploadError,
      } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE OLD IMAGE FROM STORAGE
  |--------------------------------------------------------------------------
  */

  const removeStorageImage = async (
    imageUrl
  ) => {
    if (!imageUrl) return;

    try {
      const marker =
        `/storage/v1/object/public/${BUCKET_NAME}/`;

      const index =
        imageUrl.indexOf(marker);

      if (index === -1) return;

      const imagePath =
        imageUrl.substring(
          index + marker.length
        );

      if (!imagePath) return;

      const {
        error: storageError,
      } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([imagePath]);

      if (storageError) {
        console.error(
          "Storage image remove error:",
          storageError
        );
      }
    } catch (error) {
      console.error(
        "Remove old image error:",
        error
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE CHARITY
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Charity name is required."
      );
      return;
    }

    if (!form.description.trim()) {
      setError(
        "Charity description is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Admin session not found."
        );
      }

      let imageUrl =
        editingCharity?.image_url || null;

      /*
       * If a new image was selected,
       * upload it first.
       */
      if (selectedImage) {
        imageUrl =
          await uploadImage(selectedImage);
      }

      const payload = {
        name: form.name.trim(),
        description:
          form.description.trim(),
        category:
          form.category.trim() || null,
        website_url:
          form.website_url.trim() || null,
        image_url: imageUrl,
        featured: form.featured,
        active: form.active,
      };

      const isEditing =
        Boolean(editingCharity);

      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/admin/charities/${editingCharity.id}`
        : `${import.meta.env.VITE_API_URL}/api/admin/charities`;

      const response = await fetch(
        url,
        {
          method: isEditing
            ? "PUT"
            : "POST",

          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(payload),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        /*
         * If database update fails after
         * uploading a new image, clean it up.
         */
        if (
          selectedImage &&
          imageUrl &&
          imageUrl !==
            editingCharity?.image_url
        ) {
          await removeStorageImage(
            imageUrl
          );
        }

        throw new Error(
          result.message ||
            "Failed to save charity."
        );
      }

      /*
       * If editing and a new image was
       * uploaded successfully, remove
       * the old image.
       */
      if (
        isEditing &&
        selectedImage &&
        editingCharity?.image_url &&
        imageUrl !==
          editingCharity.image_url
      ) {
        await removeStorageImage(
          editingCharity.image_url
        );
      }

      if (isEditing) {
        setCharities(
          (currentCharities) =>
            currentCharities.map(
              (item) =>
                item.id ===
                editingCharity.id
                  ? result.charity
                  : item
            )
        );

        setSuccess(
          "Charity updated successfully."
        );
      } else {
        setCharities(
          (currentCharities) => [
            result.charity,
            ...currentCharities,
          ]
        );

        setSuccess(
          "Charity created successfully."
        );
      }

      setShowModal(false);

      setEditingCharity(null);
      setForm(initialForm);

      setSelectedImage(null);
      setImagePreview("");
    } catch (error) {
      console.error(
        "Save charity error:",
        error
      );

      setError(
        error.message ||
          "Failed to save charity."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE ACTIVE
  |--------------------------------------------------------------------------
  */

  const toggleCharity = async (
    charity
  ) => {
    try {
      setUpdatingId(charity.id);
      setError("");
      setSuccess("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Admin session not found."
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/charities/${charity.id}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: charity.name,
            description:
              charity.description || "",
            category:
              charity.category || "",
            website_url:
              charity.website_url || "",
            image_url:
              charity.image_url || null,
            featured:
              Boolean(charity.featured),
            active:
              !charity.active,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update charity status."
        );
      }

      setCharities(
        (currentCharities) =>
          currentCharities.map(
            (item) =>
              item.id === charity.id
                ? result.charity
                : item
          )
      );

      setSuccess(
        `${charity.name} ${
          charity.active
            ? "disabled"
            : "enabled"
        } successfully.`
      );
    } catch (error) {
      console.error(
        "Toggle charity error:",
        error
      );

      setError(
        error.message ||
          "Failed to update charity status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | TOGGLE FEATURED
  |--------------------------------------------------------------------------
  */

  const toggleFeatured = async (
    charity
  ) => {
    try {
      setUpdatingId(charity.id);
      setError("");
      setSuccess("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Admin session not found."
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/charities/${charity.id}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: charity.name,
            description:
              charity.description || "",
            category:
              charity.category || "",
            website_url:
              charity.website_url || "",
            image_url:
              charity.image_url || null,
            featured:
              !charity.featured,
            active:
              charity.active,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to update featured status."
        );
      }

      setCharities(
        (currentCharities) =>
          currentCharities.map(
            (item) =>
              item.id === charity.id
                ? result.charity
                : item
          )
      );

      setSuccess(
        `${charity.name} ${
          charity.featured
            ? "removed from"
            : "added to"
        } featured charities.`
      );
    } catch (error) {
      console.error(
        "Featured charity error:",
        error
      );

      setError(
        error.message ||
          "Failed to update featured status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE CHARITY
  |--------------------------------------------------------------------------
  */

  const deleteCharity = async (
    charity
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${charity.name}" permanently?\n\nThis will also remove its image from storage.`
      );

    if (!confirmed) return;

    try {
      setDeletingId(charity.id);
      setError("");
      setSuccess("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Admin session not found."
        );
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/charities/${charity.id}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to delete charity."
        );
      }

      setCharities(
        (currentCharities) =>
          currentCharities.filter(
            (item) =>
              item.id !== charity.id
          )
      );

      setSuccess(
        `${charity.name} deleted successfully.`
      );
    } catch (error) {
      console.error(
        "Delete charity error:",
        error
      );

      setError(
        error.message ||
          "Failed to delete charity."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadCharities();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="charities-loading">
        <div className="charities-loader"></div>
        <p>Loading charities...</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="charities-page">

      <div className="charities-container">

        {/* Header */}
        <div className="charities-header">

          <div>
            <p className="charities-eyebrow">
              ADMIN PANEL
            </p>

            <h1>Charities</h1>

            <p className="charities-subtitle">
              Manage charities available to
              subscribers.
            </p>
          </div>

          <div className="charities-header-actions">

            <button
              type="button"
              className="charity-add-btn"
              onClick={openAddModal}
            >
              <Plus size={17} />
              Add Charity
            </button>

            <div className="charities-count">
              <span>Total</span>
              <strong>
                {charities.length}
              </strong>
            </div>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="charities-alert charities-alert-error">
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="charities-alert charities-alert-success">
            <span>{success}</span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Empty */}
        {charities.length === 0 ? (
          <div className="charities-empty">

            <ImageIcon size={40} />

            <h2>No charities found</h2>

            <p>
              Add your first charity to make it
              available to subscribers.
            </p>

            <button
              type="button"
              className="charity-add-btn"
              onClick={openAddModal}
            >
              <Plus size={17} />
              Add Charity
            </button>

          </div>
        ) : (
          <div className="charities-grid">

            {charities.map((charity) => {

              const isUpdating =
                updatingId === charity.id;

              const isDeleting =
                deletingId === charity.id;

              return (
                <div
                  key={charity.id}
                  className={`charity-card ${
                    !charity.active
                      ? "charity-card-inactive"
                      : ""
                  }`}
                >

                  {/* Image */}
                  {charity.image_url ? (
                    <div className="charity-image-wrapper">

                      <img
                        src={
                          charity.image_url
                        }
                        alt={charity.name}
                        className="charity-image"
                      />

                      {charity.featured && (
                        <span className="charity-featured-badge">
                          <Star
                            size={12}
                            fill="currentColor"
                          />
                          Featured
                        </span>
                      )}

                    </div>
                  ) : (
                    <div className="charity-image-placeholder">

                      <span>
                        {charity.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "C"}
                      </span>

                      {charity.featured && (
                        <span className="charity-featured-badge">
                          <Star
                            size={12}
                            fill="currentColor"
                          />
                          Featured
                        </span>
                      )}

                    </div>
                  )}

                  {/* Body */}
                  <div className="charity-card-body">

                    <div className="charity-card-top">

                      <h2>
                        {charity.name}
                      </h2>

                      <span
                        className={`charity-status ${
                          charity.active
                            ? "charity-status-active"
                            : "charity-status-inactive"
                        }`}
                      >
                        {charity.active
                          ? "Active"
                          : "Inactive"}
                      </span>

                    </div>

                    <p className="charity-description">
                      {charity.description ||
                        "No description available."}
                    </p>

                    <div className="charity-meta-row">

                      <div className="charity-meta">
                        {charity.category ||
                          "General"}
                      </div>

                      {charity.website_url && (
                        <a
                          href={
                            charity.website_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="charity-website"
                        >
                          <ExternalLink
                            size={13}
                          />
                          Website
                        </a>
                      )}

                    </div>

                    {/* Featured */}
                    <button
                      type="button"
                      className={`charity-featured-btn ${
                        charity.featured
                          ? "featured-active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleFeatured(
                          charity
                        )
                      }
                      disabled={
                        isUpdating ||
                        isDeleting
                      }
                    >
                      <Star
                        size={15}
                        fill={
                          charity.featured
                            ? "currentColor"
                            : "none"
                        }
                      />

                      {charity.featured
                        ? "Featured"
                        : "Make Featured"}
                    </button>

                    {/* Actions */}
                    <div className="charity-actions">

                      <button
                        type="button"
                        className="charity-edit-btn"
                        onClick={() =>
                          openEditModal(
                            charity
                          )
                        }
                        disabled={
                          isUpdating ||
                          isDeleting
                        }
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className={`charity-toggle-btn ${
                          charity.active
                            ? "charity-disable-btn"
                            : "charity-enable-btn"
                        }`}
                        onClick={() =>
                          toggleCharity(
                            charity
                          )
                        }
                        disabled={
                          isUpdating ||
                          isDeleting
                        }
                      >
                        {isUpdating ? (
                          <>
                            <RefreshCw
                              size={14}
                              className="charity-spin"
                            />
                            Updating...
                          </>
                        ) : charity.active ? (
                          "Disable"
                        ) : (
                          "Enable"
                        )}
                      </button>

                      <button
                        type="button"
                        className="charity-delete-btn"
                        onClick={() =>
                          deleteCharity(
                            charity
                          )
                        }
                        disabled={
                          isUpdating ||
                          isDeleting
                        }
                      >
                        {isDeleting ? (
                          <>
                            <RefreshCw
                              size={14}
                              className="charity-spin"
                            />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2
                              size={14}
                            />
                            Delete
                          </>
                        )}
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="charity-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget &&
              !saving &&
              !uploadingImage
            ) {
              closeModal();
            }
          }}
        >

          <div className="charity-modal">

            {/* Modal Header */}
            <div className="charity-modal-header">

              <div>
                <span className="charities-eyebrow">
                  ADMIN PANEL
                </span>

                <h2>
                  {editingCharity
                    ? "Edit Charity"
                    : "Add Charity"}
                </h2>

                <p>
                  {editingCharity
                    ? "Update charity information and media."
                    : "Create a new charity for subscribers."}
                </p>
              </div>

              <button
                type="button"
                className="charity-modal-close"
                onClick={closeModal}
                disabled={
                  saving ||
                  uploadingImage
                }
              >
                <X size={19} />
              </button>

            </div>

            {/* Form */}
            <form
              className="charity-form"
              onSubmit={handleSubmit}
            >

              {/* Image */}
              <div className="charity-form-image-section">

                <div className="charity-form-image">

                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Charity preview"
                    />
                  ) : (
                    <div className="charity-form-image-empty">
                      <ImageIcon size={30} />
                      <span>
                        No image
                      </span>
                    </div>
                  )}

                </div>

                <div className="charity-image-upload">

                  <label
                    htmlFor="charity-image"
                    className="charity-upload-btn"
                  >
                    <Upload size={16} />

                    {uploadingImage
                      ? "Uploading..."
                      : "Choose Image"}
                  </label>

                  <input
                    id="charity-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleImageChange
                    }
                    disabled={
                      saving ||
                      uploadingImage
                    }
                  />

                  <small>
                    JPG, PNG or WebP · Max 5MB
                  </small>

                </div>

              </div>

              {/* Name */}
              <div className="charity-form-group">

                <label htmlFor="charity-name">
                  Charity Name *
                </label>

                <input
                  id="charity-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Hope Foundation"
                  required
                  disabled={saving}
                />

              </div>

              {/* Description */}
              <div className="charity-form-group">

                <label htmlFor="charity-description">
                  Description *
                </label>

                <textarea
                  id="charity-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what this charity does..."
                  rows="4"
                  required
                  disabled={saving}
                />

              </div>

              {/* Category */}
              <div className="charity-form-group">

                <label htmlFor="charity-category">
                  Category
                </label>

                <input
                  id="charity-category"
                  name="category"
                  type="text"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Education, Environment, Health..."
                  disabled={saving}
                />

              </div>

              {/* Website */}
              <div className="charity-form-group">

                <label htmlFor="charity-website">
                  Website URL
                </label>

                <input
                  id="charity-website"
                  name="website_url"
                  type="url"
                  value={form.website_url}
                  onChange={handleChange}
                  placeholder="https://example.org"
                  disabled={saving}
                />

              </div>

              {/* Toggles */}
              <div className="charity-form-options">

                <label className="charity-checkbox">

                  <input
                    type="checkbox"
                    name="featured"
                    checked={
                      form.featured
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  />

                  <span>
                    <Star size={15} />
                    Featured charity
                  </span>

                </label>

                <label className="charity-checkbox">

                  <input
                    type="checkbox"
                    name="active"
                    checked={
                      form.active
                    }
                    onChange={
                      handleChange
                    }
                    disabled={saving}
                  />

                  <span>
                    Active charity
                  </span>

                </label>

              </div>

              {/* Footer */}
              <div className="charity-modal-footer">

                <button
                  type="button"
                  className="charity-modal-cancel"
                  onClick={closeModal}
                  disabled={
                    saving ||
                    uploadingImage
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="charity-modal-save"
                  disabled={
                    saving ||
                    uploadingImage
                  }
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="charity-spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />

                      {editingCharity
                        ? "Save Changes"
                        : "Create Charity"}
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Charities;