import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Hospital,
  TestTube,
  Heart,
  Stethoscope,
  ExternalLink,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { getTimeline } from '../api';
import SourceModal from '../components/SourceModal';

export default function TimelinePage() {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSourceItem, setSelectedSourceItem] = useState(null);

  useEffect(() => {
    getTimeline()
      .then((data) => setTimelineEvents(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getEventIcon = (category) => {
    switch (category) {
      case 'Discharge':
        return <Hospital className="w-5 h-5 text-white" />;
      case 'Test':
        return <TestTube className="w-5 h-5 text-white" />;
      case 'Appointment':
        return <Heart className="w-5 h-5 text-white" />;
      default:
        return <Stethoscope className="w-5 h-5 text-white" />;
    }
  };

  const getEventColor = (status, category) => {
    if (status === 'Completed' || category === 'Discharge') return 'bg-emerald-600 ring-emerald-100';
    if (status === 'Needs Review') return 'bg-rose-600 ring-rose-100';
    return 'bg-sky-600 ring-sky-100';
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          <Sparkles className="w-3.5 h-3.5" />
          Chronological Care Roadmap
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Care Plan Timeline
        </h1>
        <p className="text-xs text-slate-500">
          Step-by-step milestones organized sequentially from hospital discharge to long-term follow-up review.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading timeline events...</div>
      ) : (
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
          {timelineEvents.map((evt, idx) => {
            const isCompleted = evt.status === 'Completed';
            const isNeedsReview = evt.status === 'Needs Review';

            return (
              <div key={evt.id || idx} className="relative group">
                {/* Node icon pill */}
                <div
                  className={`absolute -left-6 sm:-left-10 top-1 w-9 h-9 rounded-2xl flex items-center justify-center ring-4 transition-transform group-hover:scale-110 shadow-sm ${getEventColor(
                    evt.status,
                    evt.category
                  )}`}
                >
                  {getEventIcon(evt.category)}
                </div>

                {/* Event Card */}
                <div
                  className={`ml-6 sm:ml-8 bg-white p-5 rounded-2xl border transition-all shadow-xs space-y-3 hover:shadow-sm ${
                    isNeedsReview
                      ? 'border-rose-200 bg-rose-50/20'
                      : isCompleted
                      ? 'border-emerald-100'
                      : 'border-slate-200/90 hover:border-sky-300'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-sky-700 bg-sky-50 border border-sky-100 px-3 py-1 rounded-lg">
                        {evt.date}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {evt.category}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isNeedsReview
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-sky-700 transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="truncate max-w-[70%]">
                      Source: {evt.source}
                    </span>
                    <button
                      onClick={() => setSelectedSourceItem(evt)}
                      className="text-sky-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Evidence</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Source Evidence Modal */}
      {selectedSourceItem && (
        <SourceModal
          item={selectedSourceItem}
          isOpen={!!selectedSourceItem}
          onClose={() => setSelectedSourceItem(null)}
        />
      )}
    </div>
  );
}
