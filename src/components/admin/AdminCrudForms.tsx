import React, { useState } from 'react';
import { Category, Device, DeviceSection, FAQItem, SetupStep } from '../../types/device';
import { MediaAsset } from '../../types/admin';
import { createEmptyDevice, emptyStep, slugify } from '../../lib/catalog';
import { CrudModal, fieldClass, labelClass } from './CrudModal';

export const DeviceFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initial?: Device | null;
  onSave: (device: Device, isNew: boolean) => void;
}> = ({ isOpen, onClose, categories, initial, onSave }) => {
  const isNew = !initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? categories[0]?.slug ?? '');
  const [status, setStatus] = useState<Device['status']>(initial?.status ?? 'Ready');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [osChoice, setOsChoice] = useState<'both' | 'windows' | 'mac'>(() => {
    const s = initial?.specs || [];
    if (s.includes('windows') && s.includes('mac')) return 'both';
    if (s.includes('windows')) return 'windows';
    if (s.includes('mac')) return 'mac';
    return 'both';
  });
  const [imageUrl, setImageUrl] = useState(initial?.image ?? '');
  const [faqText, setFaqText] = useState(() => {
    if (!initial?.faqs || initial.faqs.length === 0) return '';
    return initial.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
  });

  React.useEffect(() => {
    setName(initial?.name ?? '');
    setCategorySlug(initial?.categorySlug ?? categories[0]?.slug ?? '');
    setStatus(initial?.status ?? 'Ready');
    setDescription(initial?.description ?? '');
    setImageUrl(initial?.image ?? '');
    const s = initial?.specs || [];
    if (s.includes('windows') && s.includes('mac')) setOsChoice('both');
    else if (s.includes('windows')) setOsChoice('windows');
    else if (s.includes('mac')) setOsChoice('mac');
    else setOsChoice('both');

    if (initial?.faqs && initial.faqs.length > 0) {
      setFaqText(initial.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n'));
    } else {
      setFaqText('');
    }
  }, [initial, isOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    const cat = categories.find((c) => c.slug === categorySlug);
    const osList = osChoice === 'both' ? ['windows', 'mac'] : [osChoice];

    // Parse FAQ text
    const parsedFaqs: FAQItem[] = [];
    if (faqText.trim()) {
      const blocks = faqText.split(/\n\s*\n/);
      for (const b of blocks) {
        const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
        const qLine = lines.find((l) => l.startsWith('Q:') || l.startsWith('Tanya:'));
        const aLine = lines.find((l) => l.startsWith('A:') || l.startsWith('Jawab:'));
        if (qLine && aLine) {
          parsedFaqs.push({
            question: qLine.replace(/^(Q:|Tanya:)\s*/i, ''),
            answer: aLine.replace(/^(A:|Jawab:)\s*/i, ''),
          });
        } else if (lines.length >= 2) {
          parsedFaqs.push({
            question: lines[0].replace(/^Q:\s*/i, ''),
            answer: lines.slice(1).join(' ').replace(/^A:\s*/i, ''),
          });
        }
      }
    }

    if (initial) {
      onSave(
        {
          ...initial,
          name: name.trim(),
          category: cat?.title ?? initial.category,
          categorySlug,
          status,
          description: description.trim(),
          image: imageUrl.trim() || undefined,
          specs: osList,
          faqs: parsedFaqs.length > 0 ? parsedFaqs : initial.faqs,
        },
        false
      );
    } else {
      const empty = createEmptyDevice({
        name: name.trim(),
        category: cat?.title ?? 'Umum',
        categorySlug,
        description: description.trim(),
        status,
        specs: osList,
      });
      empty.image = imageUrl.trim() || undefined;
      empty.faqs = parsedFaqs;
      onSave(empty, true);
    }
    onClose();
  };

  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? 'Tambah Perangkat' : 'Ubah Perangkat'}
      subtitle="Data disimpan ke Supabase PostgreSQL & langsung tampil di situs publik."
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nama Perangkat</label>
            <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Kategori</label>
            <select className={fieldClass} value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Status Perangkat</label>
            <select
              className={fieldClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as Device['status'])}
            >
              <option value="Ready">Ready (Siap Digunakan)</option>
              <option value="Maintenance">Maintenance (Dalam Perawatan)</option>
              <option value="New">New (Perangkat Baru)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Dukungan OS (tambah_os)</label>
            <select
              className={fieldClass}
              value={osChoice}
              onChange={(e) => setOsChoice(e.target.value as 'both' | 'windows' | 'mac')}
            >
              <option value="both">Bisa Dua-duanya (Windows & Mac)</option>
              <option value="windows">Hanya Windows</option>
              <option value="mac">Hanya macOS</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Deskripsi Singkat</label>
          <textarea
            className={`${fieldClass} min-h-[72px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Deskripsi fungsi dan lokasi perangkat di kantor..."
          />
        </div>

        <div>
          <label className={labelClass}>URL Gambar Perangkat (Opsional)</label>
          <input
            className={fieldClass}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/... atau link foto perangkat"
          />
        </div>

        <div>
          <label className={labelClass}>FAQ / Tanya Jawab (Format: Q: ... \n A: ...)</label>
          <textarea
            className={`${fieldClass} min-h-[80px] font-mono text-[11px]`}
            value={faqText}
            onChange={(e) => setFaqText(e.target.value)}
            placeholder={"Q: Mengapa printer tidak terdeteksi?\nA: Pastikan terhubung ke Wi-Fi 2.4 GHz kantor.\n\nQ: Bagaimana cara cetak bolak-balik?\nA: Aktifkan opsi Duplex Printing."}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700">
            Batal
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white">
            Simpan Perangkat
          </button>
        </div>
      </form>
    </CrudModal>
  );
};

export const CategoryFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initial?: Category | null;
  onSave: (category: Category, isNew: boolean) => void;
}> = ({ isOpen, onClose, initial, onSave }) => {
  const isNew = !initial;
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'Monitor');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 1);
  const [available, setAvailable] = useState(initial?.available ?? true);

  React.useEffect(() => {
    setTitle(initial?.title ?? '');
    setSlug(initial?.slug ?? '');
    setDescription(initial?.description ?? '');
    setIcon(initial?.icon ?? 'Monitor');
    setSortOrder(initial?.sort_order ?? 1);
    setAvailable(initial?.available ?? true);
  }, [initial, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextSlug = slugify(slug || title);
    onSave(
      {
        id: initial?.id ?? nextSlug,
        slug: nextSlug,
        title: title.trim(),
        description: description.trim(),
        icon,
        available,
        sort_order: Number(sortOrder) || 1,
        deviceCount: initial?.deviceCount ?? 0,
      },
      isNew
    );
    onClose();
  };

  return (
    <CrudModal isOpen={isOpen} onClose={onClose} title={isNew ? 'Tambah Kategori' : 'Ubah Kategori'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Nama Kategori</label>
          <input
            className={fieldClass}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (isNew) setSlug(slugify(e.target.value));
            }}
            required
            placeholder="Contoh: Printer Kantor, Smart TV, dll."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Slug URL</label>
            <input className={fieldClass} value={slug} onChange={(e) => setSlug(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Urutan (sort_order)</label>
            <input
              type="number"
              className={fieldClass}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={1}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Ikon (Printer, Share2, Projector, Tv, Fingerprint, Monitor)</label>
          <input className={fieldClass} value={icon} onChange={(e) => setIcon(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Deskripsi Kategori</label>
          <textarea className={`${fieldClass} min-h-[80px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          Tampilkan di situs publik
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700">
            Batal
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white">
            Simpan Kategori
          </button>
        </div>
      </form>
    </CrudModal>
  );
};

const StepFields: React.FC<{
  steps: SetupStep[];
  onChange: (steps: SetupStep[]) => void;
}> = ({ steps, onChange }) => (
  <div className="space-y-3">
    {steps.map((step, idx) => (
      <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500">Langkah {idx + 1}</span>
          <button
            type="button"
            className="text-[11px] font-semibold text-rose-600"
            onClick={() => onChange(steps.filter((_, i) => i !== idx))}
          >
            Hapus
          </button>
        </div>
        <input
          className={fieldClass}
          value={step.title}
          onChange={(e) =>
            onChange(steps.map((s, i) => (i === idx ? { ...s, title: e.target.value } : s)))
          }
          placeholder="Judul langkah"
        />
        <textarea
          className={`${fieldClass} min-h-[64px]`}
          value={step.description}
          onChange={(e) =>
            onChange(steps.map((s, i) => (i === idx ? { ...s, description: e.target.value } : s)))
          }
          placeholder="Deskripsi"
        />
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...steps, emptyStep(`Langkah ${steps.length + 1}`)])}
      className="text-xs font-bold text-blue-600"
    >
      + Tambah langkah
    </button>
  </div>
);

interface StepRowItem {
  title: string;
  description: string;
  konten_windows: string;
  konten_mac: string;
}

export const GuideFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  device: Device | null;
  sectionKey: keyof Device['sections'] | null;
  onSave: (section: DeviceSection) => void;
}> = ({ isOpen, onClose, device, sectionKey, onSave }) => {
  const section = device && sectionKey ? device.sections[sectionKey] : undefined;
  const [title, setTitle] = useState(section?.title ?? '');
  const [tabLabel, setTabLabel] = useState(section?.tabLabel ?? '');
  const [steps, setSteps] = useState<StepRowItem[]>([]);

  React.useEffect(() => {
    setTitle(section?.title ?? 'Langkah Panduan Setup');
    setTabLabel(section?.tabLabel ?? '1. Setup');
    const win = section?.osSteps?.windows || section?.steps || [];
    const mac = section?.osSteps?.mac || [];
    const maxLen = Math.max(win.length, mac.length, 1);
    const rows: StepRowItem[] = [];
    for (let i = 0; i < maxLen; i++) {
      const w = win[i];
      const m = mac[i];
      rows.push({
        title: w?.title || m?.title || `Langkah ${i + 1}`,
        description: w?.description || m?.description || '',
        konten_windows: w?.details ? w.details.join('\n') : (w?.description || ''),
        konten_mac: m?.details ? m.details.join('\n') : (m?.description || ''),
      });
    }
    setSteps(rows);
  }, [section, isOpen]);

  if (!section) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const winSteps: SetupStep[] = steps.map((s) => ({
      title: s.title,
      description: s.description,
      details: s.konten_windows.split('\n').map((l) => l.trim()).filter(Boolean),
    }));
    const macSteps: SetupStep[] = steps.map((s) => ({
      title: s.title,
      description: s.description,
      details: s.konten_mac.split('\n').map((l) => l.trim()).filter(Boolean),
    }));

    onSave({
      ...section,
      title: title.trim(),
      tabLabel: tabLabel.trim(),
      osSteps: { windows: winSteps, mac: macSteps },
      steps: undefined,
    });
    onClose();
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        title: `Langkah ${steps.length + 1}`,
        description: '',
        konten_windows: '',
        konten_mac: '',
      },
    ]);
  };

  const removeStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const updateStep = (idx: number, patch: Partial<StepRowItem>) => {
    setSteps(steps.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  return (
    <CrudModal
      wide
      isOpen={isOpen}
      onClose={onClose}
      title={`Kelola Panduan: ${section.title}`}
      subtitle={`${device?.name} (Disimpan ke tabel steps di Supabase)`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <label className={labelClass}>Judul Modul Panduan</label>
            <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className={labelClass}>Label Tab</label>
            <input className={fieldClass} value={tabLabel} onChange={(e) => setTabLabel(e.target.value)} required />
          </div>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Langkah #{idx + 1}
                </span>
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Hapus Langkah
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Judul Langkah (title)</label>
                  <input
                    className={fieldClass}
                    value={step.title}
                    onChange={(e) => updateStep(idx, { title: e.target.value })}
                    required
                    placeholder="Contoh: Langkah 1: Sambungkan Wi-Fi"
                  />
                </div>
                <div>
                  <label className={labelClass}>Deskripsi Ringkas (description)</label>
                  <input
                    className={fieldClass}
                    value={step.description}
                    onChange={(e) => updateStep(idx, { description: e.target.value })}
                    placeholder="Penjelasan singkat tujuan langkah ini..."
                  />
                </div>
              </div>

              {/* 2 Kolom: Windows & Mac */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    🪟 Konten Panduan Windows (konten_windows)
                  </label>
                  <textarea
                    className={`${fieldClass} min-h-[96px] font-mono text-[11px] leading-relaxed`}
                    value={step.konten_windows}
                    onChange={(e) => updateStep(idx, { konten_windows: e.target.value })}
                    placeholder={"1. Nyalakan printer.\n2. Hubungkan ke SSID Wi-Fi kantor.\n3. Tambahkan di Windows Settings."}
                  />
                  <span className="text-[10px] text-slate-400">Dapat berupa instruksi baris bernomor (1, 2, 3...)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    🍎 Konten Panduan macOS (konten_mac)
                  </label>
                  <textarea
                    className={`${fieldClass} min-h-[96px] font-mono text-[11px] leading-relaxed`}
                    value={step.konten_mac}
                    onChange={(e) => updateStep(idx, { konten_mac: e.target.value })}
                    placeholder={"1. Nyalakan printer.\n2. Pastikan Mac terhubung ke Wi-Fi yang sama.\n3. Tambahkan via Printers & Scanners."}
                  />
                  <span className="text-[10px] text-slate-400">Dapat berupa instruksi baris bernomor (1, 2, 3...)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={addStep}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40"
          >
            + Tambah Langkah Baru
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500"
            >
              Simpan Semua Langkah
            </button>
          </div>
        </div>
      </form>
    </CrudModal>
  );
};

export const FaqFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: FAQItem[];
  onSave: (items: FAQItem[]) => void;
}> = ({ isOpen, onClose, title, items, onSave }) => {
  const [list, setList] = useState<FAQItem[]>(items);

  React.useEffect(() => {
    setList(items);
  }, [items, isOpen]);

  return (
    <CrudModal isOpen={isOpen} onClose={onClose} title={title} wide>
      <div className="space-y-3">
        {list.map((item, idx) => (
          <div key={idx} className="space-y-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <input
              className={fieldClass}
              value={item.question}
              onChange={(e) => setList(list.map((f, i) => (i === idx ? { ...f, question: e.target.value } : f)))}
              placeholder="Pertanyaan"
            />
            <textarea
              className={`${fieldClass} min-h-[64px]`}
              value={item.answer}
              onChange={(e) => setList(list.map((f, i) => (i === idx ? { ...f, answer: e.target.value } : f)))}
              placeholder="Jawaban"
            />
            <button type="button" className="text-[11px] font-semibold text-rose-600" onClick={() => setList(list.filter((_, i) => i !== idx))}>
              Hapus
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-xs font-bold text-blue-600"
          onClick={() => setList([...list, { question: '', answer: '' }])}
        >
          + Tambah FAQ
        </button>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700">
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(list.filter((f) => f.question.trim() && f.answer.trim()));
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white"
          >
            Simpan FAQ
          </button>
        </div>
      </div>
    </CrudModal>
  );
};

export const MediaFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initial?: MediaAsset | null;
  onSave: (asset: MediaAsset, isNew: boolean) => void;
}> = ({ isOpen, onClose, initial, onSave }) => {
  const isNew = !initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<MediaAsset['type']>(initial?.type ?? 'driver');
  const [fileSize, setFileSize] = useState(initial?.fileSize ?? '');
  const [targetDevice, setTargetDevice] = useState(initial?.targetDevice ?? '');
  const [targetOs, setTargetOs] = useState<MediaAsset['targetOs']>(initial?.targetOs ?? 'all');
  const [url, setUrl] = useState(initial?.url ?? '');

  React.useEffect(() => {
    setName(initial?.name ?? '');
    setType(initial?.type ?? 'driver');
    setFileSize(initial?.fileSize ?? '');
    setTargetDevice(initial?.targetDevice ?? '');
    setTargetOs(initial?.targetOs ?? 'all');
    setUrl(initial?.url ?? '');
  }, [initial, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        id: initial?.id ?? `media-${Date.now()}`,
        name: name.trim(),
        type,
        fileSize: fileSize.trim() || '-',
        targetDevice: targetDevice.trim(),
        targetOs,
        url: url.trim(),
        updatedAt: new Date().toISOString().slice(0, 10),
      },
      isNew
    );
    onClose();
  };

  return (
    <CrudModal isOpen={isOpen} onClose={onClose} title={isNew ? 'Tambah Media' : 'Ubah Media'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Nama file</label>
          <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tipe</label>
            <select className={fieldClass} value={type} onChange={(e) => setType(e.target.value as MediaAsset['type'])}>
              <option value="driver">driver</option>
              <option value="document">document</option>
              <option value="image">image</option>
              <option value="guide">guide</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>OS</label>
            <select className={fieldClass} value={targetOs} onChange={(e) => setTargetOs(e.target.value as MediaAsset['targetOs'])}>
              <option value="all">all</option>
              <option value="windows">windows</option>
              <option value="mac">mac</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Target perangkat</label>
          <input className={fieldClass} value={targetDevice} onChange={(e) => setTargetDevice(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Ukuran</label>
          <input className={fieldClass} value={fileSize} onChange={(e) => setFileSize(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>URL</label>
          <input className={fieldClass} value={url} onChange={(e) => setUrl(e.target.value)} required />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700">
            Batal
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white">
            Simpan
          </button>
        </div>
      </form>
    </CrudModal>
  );
};
