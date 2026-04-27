import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStudent } from '../../context/StudentContext';
import { validateURL, validateRequiredText } from '../../utils/validators';

const emptyForm = {
  title: '',
  portfolio_url: '',
  description: '',
  built_with: '',
  build_details: '',
};
//added safe-keep branch
function PortfolioLinks() {
  const { profile, addPortfolio, updatePortfolio, deletePortfolio } = useStudent();
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setItems(profile?.portfolios || []);
  }, [profile]);

  const validateForm = () => {
    const next = {};

    const titleVal = validateRequiredText(form.title, 'Title', 3, 150);
    if (!titleVal.valid) next.title = titleVal.message;

    const linkVal = validateURL(form.portfolio_url);
    if (!form.portfolio_url.trim()) next.portfolio_url = 'Portfolio URL is required';
    else if (!linkVal.valid) next.portfolio_url = linkVal.message;

    if (form.description?.trim()) {
      const descVal = validateRequiredText(form.description, 'Description', 10, 1000);
      if (!descVal.valid) next.description = descVal.message;
    }

    if (form.built_with?.trim()) {
      const builtWithVal = validateRequiredText(form.built_with, 'Built With', 2, 500);
      if (!builtWithVal.valid) next.built_with = builtWithVal.message;
    }

    if (form.build_details?.trim()) {
      const detailsVal = validateRequiredText(form.build_details, 'Build Details', 10, 2000);
      if (!detailsVal.valid) next.build_details = detailsVal.message;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setForm({
      title: entry.title || '',
      portfolio_url: entry.portfolio_url || '',
      description: entry.description || '',
      built_with: entry.built_with || '',
      build_details: entry.build_details || '',
    });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      if (editing) {
        await updatePortfolio(editing.id, form);
        alert('Portfolio updated successfully.');
      } else {
        await addPortfolio(form);
        alert('Portfolio added successfully.');
      }
      closeModal();
    } catch (error) {
      console.error('Portfolio save failed:', error);
      alert('Failed to save portfolio entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this portfolio entry?')) return;
    try {
      await deletePortfolio(id);
      alert('Portfolio deleted.');
    } catch (error) {
      console.error('Portfolio delete failed:', error);
      alert('Failed to delete portfolio.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
          <p className="text-sm text-gray-600">
            Add your portfolio link, description, stack, and how it is built.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          + Add Portfolio
        </button>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-gray-300 p-8 text-center text-gray-500">
          No portfolio entries added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((entry) => (
            <div key={entry.id} className="border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">{entry.title}</h4>
                  <a
                    href={entry.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all"
                  >
                    {entry.portfolio_url}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(entry)}
                    className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {entry.description && (
                <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{entry.description}</p>
              )}
              {entry.built_with && (
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-medium">Built With:</span> {entry.built_with}
                </p>
              )}
              {entry.build_details && (
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  <span className="font-medium">How It Is Built:</span> {entry.build_details}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[1000] bg-black/50 p-4 flex items-center justify-center" onClick={closeModal}>
            <div className="w-full max-w-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Portfolio' : 'Add Portfolio'}</h4>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">x</button>
              </div>

              <form onSubmit={onSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Personal Portfolio Website"
                  />
                  {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL *</label>
                  <input
                    type="url"
                    value={form.portfolio_url}
                    onChange={(e) => setForm((prev) => ({ ...prev, portfolio_url: e.target.value }))}
                    className="w-full border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://your-portfolio.com"
                  />
                  {errors.portfolio_url && <p className="text-xs text-red-600 mt-1">{errors.portfolio_url}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="What this portfolio showcases"
                  />
                  {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Built With</label>
                  <input
                    type="text"
                    value={form.built_with}
                    onChange={(e) => setForm((prev) => ({ ...prev, built_with: e.target.value }))}
                    className="w-full border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="React, Tailwind, Node.js"
                  />
                  {errors.built_with && <p className="text-xs text-red-600 mt-1">{errors.built_with}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">How It Is Built</label>
                  <textarea
                    value={form.build_details}
                    onChange={(e) => setForm((prev) => ({ ...prev, build_details: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Architecture, deployment, API design, auth, etc."
                  />
                  {errors.build_details && <p className="text-xs text-red-600 mt-1">{errors.build_details}</p>}
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    {submitting ? 'Saving...' : editing ? 'Update Portfolio' : 'Add Portfolio'}
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default PortfolioLinks;
