import { useState, useEffect } from 'react';
import api from '../api';
import { Loader, Wand2, X } from 'lucide-react';
import type { Resource } from '../types';

interface ResourceSuggestionProps {
  projectId: string;
  onClose: () => void;
  onResourcesAdded: () => void;
}

export default function ResourceSuggestion({
  projectId,
  onClose,
  onResourcesAdded,
}: ResourceSuggestionProps) {
  const [suggestedResources, setSuggestedResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResources, setSelectedResources] = useState<Set<string>>(
    new Set()
  );
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const loadSuggestions = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get(
          `/resources/suggestions/${projectId}`
        );
        const resources = response.data.map((r: Resource) => ({
          ...r,
          id: r.id || r._id,
        }));
        setSuggestedResources(resources);

        if (resources.length === 0) {
          setError(
            'No unassigned resources matching project skills found.'
          );
        }
      } catch (err) {
        const error = err as {
          response?: { data?: { message?: string } };
        };
        setError(
          error?.response?.data?.message ??
            'Failed to load resource suggestions.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [projectId]);

  const handleToggleResource = (resourceId: string) => {
    setSelectedResources((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(resourceId)) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });
  };

  const handleAddResources = async () => {
    if (selectedResources.size === 0) {
      setError('Please select at least one resource.');
      return;
    }

    setAdding(true);
    setError('');

    try {
      const promises = Array.from(selectedResources).map((resourceId) =>
        api.post(`/projects/${projectId}/resources/${resourceId}`)
      );

      await Promise.all(promises);
      onResourcesAdded();
      onClose();
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        error?.response?.data?.message ??
          'Failed to add resources to project.'
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-outlineVariant/20 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outlineVariant/20">
          <div className="flex items-center gap-3">
            <Wand2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Suggest Resources</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#cbc3d9] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-[#cbc3d9]">
              <Loader className="w-5 h-5 animate-spin" />
              <span>Loading suggested resources...</span>
            </div>
          ) : error && suggestedResources.length === 0 ? (
            <div className="px-4 py-3 bg-errorContainer/30 border border-error/30 rounded-lg text-error text-sm">
              {error}
            </div>
          ) : suggestedResources.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-[#cbc3d9] uppercase tracking-wider font-medium">
                Available Resources ({suggestedResources.length})
              </p>
              {suggestedResources.map((resource) => (
                <label
                  key={resource.id}
                  className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedResources.has(resource.id)
                      ? 'border-primary bg-primary/10'
                      : 'border-outlineVariant/20 bg-surfaceHigh hover:bg-surfaceHigh/80'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedResources.has(resource.id)}
                    onChange={() => handleToggleResource(resource.id)}
                    className="mt-1 mr-4 w-4 h-4 accent-primary cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white">{resource.name}</p>
                      <span className="text-xs bg-primaryContainer/60 text-primary px-2 py-0.5 rounded">
                        {resource.role}
                      </span>
                    </div>
                    {resource.skillSet && (
                      <p className="text-xs text-[#cbc3d9] mb-2">
                        <strong>Skills:</strong> {resource.skillSet}
                      </p>
                    )}
                    {resource.availabilityHours && (
                      <p className="text-xs text-[#cbc3d9]">
                        <strong>Available:</strong> {resource.availabilityHours}h/week
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-outlineVariant/20 bg-surfaceHigh/40">
          <p className="text-sm text-[#cbc3d9]">
            {selectedResources.size > 0
              ? `${selectedResources.size} resource(s) selected`
              : 'Select resources to add'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-secondary px-5 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAddResources}
              disabled={adding || selectedResources.size === 0}
              className="btn-primary px-5 py-2 text-sm flex items-center gap-2"
            >
              {adding && <Loader className="w-4 h-4 animate-spin" />}
              Add {selectedResources.size > 0 ? selectedResources.size : ''} Resource
              {selectedResources.size !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
