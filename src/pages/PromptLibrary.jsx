import React, { useState } from 'react';
import { Flame, Copy, Check, Cpu, Brain, Sparkles, Zap, Palette, Server, ArrowRight, ExternalLink, Layers } from 'lucide-react';
import { PROMPT_MODELS, APP_ROADMAP, PLATFORM_PROJECTS } from '@/data/promptLibrary';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const MODEL_ICONS = {
  deepseek: Cpu,
  gemini: Brain,
  venice: Sparkles
};

const ROADMAP_ICONS = {
  Features: Zap,
  Design: Palette,
  Architecture: Server
};

function PromptCard({ prompt }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#C94A00]/15 overflow-hidden hover:border-[#E8500A]/30 transition-colors">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h4 className="text-lg font-bold text-[#1A1A1A] leading-snug">{prompt.title}</h4>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E8500A]/10 hover:bg-[#E8500A]/20 text-[#E8500A] text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-sm text-[#1A1A1A]/60 mb-3 leading-relaxed">{prompt.objective}</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-1 rounded-md bg-[#1A1A1A]/5 text-[#1A1A1A]/50 font-medium">When:</span>
          <span className="text-[#1A1A1A]/70">{prompt.whenToUse}</span>
        </div>
      </div>
      <div className="bg-[#1A1A1A] p-5">
        <pre className="text-xs text-[#FFF8F2]/80 font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
{prompt.prompt}
        </pre>
      </div>
    </div>
  );
}

function ModelSection({ model }) {
  const Icon = MODEL_ICONS[model.id] || Cpu;
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: model.glowColor }}>
            <Icon className="w-6 h-6" style={{ color: model.accentColor }} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#1A1A1A]">{model.name}</h3>
            <p className="text-sm text-[#C94A00] font-medium">{model.role}</p>
          </div>
        </div>
        <p className="text-[#1A1A1A]/60 leading-relaxed max-w-3xl">{model.description}</p>
        <p className="text-sm text-[#E8500A] font-medium mt-2">{model.tagline}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {model.prompts.map((p, i) => <PromptCard key={i} prompt={p} />)}
      </div>
    </div>
  );
}

function RoadmapSection() {
  return (
    <div className="space-y-10">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-[#1A1A1A] mb-2">App Improvement Roadmap</h3>
        <p className="text-[#1A1A1A]/60">Every way Emberscot could be better — features, design, and architecture.</p>
      </div>
      {APP_ROADMAP.map((section) => {
        const Icon = ROADMAP_ICONS[section.category] || Zap;
        return (
          <div key={section.category}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#E8500A]/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#E8500A]" />
              </div>
              <h4 className="text-xl font-bold text-[#1A1A1A]">{section.category}</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-[#C94A00]/15 p-5 hover:border-[#E8500A]/30 transition-colors">
                  <h5 className="font-bold text-[#1A1A1A] mb-1.5">{item.title}</h5>
                  <p className="text-sm text-[#1A1A1A]/60 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlatformSection() {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-6 h-6 text-[#E8500A]" />
          <h3 className="text-2xl font-bold text-[#1A1A1A]">Platform Vision</h3>
        </div>
        <p className="text-[#1A1A1A]/60 max-w-3xl leading-relaxed">
          These prompt sets are designed to operate within the 1,000-clone parallel software factory — a multi-agent orchestration mesh where all projects converge on a unified platform. Each project is a node in the mesh, managed by the Deck orchestration system and anchored by the Digital Clone's twin profile.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLATFORM_PROJECTS.map((project, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#C94A00]/15 p-5 hover:border-[#E8500A]/30 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h5 className="font-bold text-[#1A1A1A]">{project.name}</h5>
              <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-[#E8500A]/10 text-[#E8500A]">
                {project.status}
              </span>
            </div>
            <p className="text-xs text-[#C94A00] font-medium mb-2">{project.role}</p>
            <p className="text-sm text-[#1A1A1A]/60 leading-relaxed mb-2">{project.description}</p>
            {project.repo && (
              <a
                href={`https://github.com/${project.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#E8500A] hover:underline"
              >
                {project.repo} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PromptLibrary() {
  const [activeTab, setActiveTab] = useState('deepseek');

  const tabs = [
    ...PROMPT_MODELS.map(m => ({ id: m.id, label: m.name, icon: MODEL_ICONS[m.id] })),
    { id: 'roadmap', label: 'App Roadmap', icon: Zap },
    { id: 'platform', label: 'Platform', icon: Layers }
  ];

  const activeModel = PROMPT_MODELS.find(m => m.id === activeTab);

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 heat-haze pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#E8500A]/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8500A]/10 border border-[#E8500A]/20 mb-6">
            <Sparkles className="w-4 h-4 text-[#E8500A]" />
            <span className="text-sm font-medium text-[#C94A00]">Cross-Domain AI Playbook</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] mb-4 leading-tight">
            AI Prompt Library for
            <span className="text-[#E8500A]"> Sharper Edges</span>
          </h1>
          <p className="text-lg text-[#1A1A1A]/60 max-w-2xl mx-auto leading-relaxed">
            Specialized prompt sets for DeepSeek, Gemini, and Venice AI — engineered for cross-domain market analysis, unique betting edge discovery, and non-linear pattern detection. Mirrored on GitHub for open collaboration.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 border-b border-[#C94A00]/15 pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                    isActive
                      ? 'border-[#E8500A] text-[#E8500A]'
                      : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {activeModel ? (
            <ModelSection model={activeModel} />
          ) : activeTab === 'roadmap' ? (
            <RoadmapSection />
          ) : activeTab === 'platform' ? (
            <PlatformSection />
          ) : null}
        </div>
      </section>

      {/* GitHub CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-[#1A1A1A] rounded-3xl p-10 sm:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#E8500A]/15 rounded-full blur-[80px]" />
          <div className="relative text-center">
            <Flame className="w-10 h-10 text-[#E8500A] mx-auto mb-4" fill="currentColor" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FFF8F2] mb-3">
              Available on GitHub
            </h2>
            <p className="text-[#FFF8F2]/60 max-w-lg mx-auto mb-6">
              All prompts are open for contribution. Fork the repo, improve the prompts, and submit a pull request. Updates here mirror to the website automatically.
            </p>
            <a
              href="https://github.com/propheticmarketpredictions-stack/emberscot/tree/main/ai-workspace/prompts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8500A] hover:bg-[#C94A00] text-white font-semibold rounded-xl transition-colors"
            >
              View on GitHub <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}