import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { X, Monitor, Volume2, Mic } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose }) => {
    const { settings, updateSettings } = useSettings();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Video Quality */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-gray-700">
                            <Monitor className="w-5 h-5" />
                            <h3 className="font-semibold">Video Quality</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {['low', 'medium', 'high'].map((quality) => (
                                <button
                                    key={quality}
                                    onClick={() => updateSettings({ videoQuality: quality })}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${settings.videoQuality === quality
                                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {quality}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Lower quality improves performance on older devices.
                        </p>
                    </div>

                    {/* Sound Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Volume2 className="w-5 h-5" />
                                <span className="font-semibold">Game Sounds</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.soundEnabled}
                                    onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Mic className="w-5 h-5" />
                                <span className="font-semibold">Voice Feedback</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.voiceFeedback}
                                    onChange={(e) => updateSettings({ voiceFeedback: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
