import React, { useState } from 'react';
import { Category, Device, DeviceSection, FAQItem, SetupStep } from '../../types/device';
import { MediaAsset } from '../../types/admin';
import { createEmptyDevice, emptyStep, slugify, extractDeviceSteps, getDeviceSupportedOs } from '../../lib/catalog';
import { CrudModal, fieldClass, labelClass } from './CrudModal';
import { CustomSelect } from '../CustomSelect';

export const DeviceFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initial?: Device | null;
  onSave: (device: Device, isNew: boolean) => void;
}> = ({ isOpen, onClose, categories, initial, onSave }) => {
  const isNew = !initial;
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? categories[0]?.slug ?? '');
  const [status, setStatus] = useState<Device['status']>(initial?.status ?? 'Ready');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [specsText, setSpecsText] = useState((initial?.specs || []).join(', '));
  const [osChoice, setOsChoice] = useState<'both' | 'windows' | 'mac'>(() => {
    const s = initial?.supported_os || initial?.specs || [];
    if (s.includes('windows') && s.includes('mac')) return 'both';
    if (s.includes('windows')) return 'windows';
    if (s.includes('mac')) return 'mac';
    return 'both';
  });
  const [imageUrl, setImageUrl] = useState(initial?.image ?? '');

  React.useEffect(() => {
    setName(initial?.name ?? '');
    setSlug(initial?.slug ?? (initial?.name ? slugify(initial.name) : ''));
    setCategorySlug(initial?.categorySlug ?? categories[0]?.slug ?? '');
    setStatus(initial?.status ?? 'Ready');
    setDescription(initial?.description ?? '');
    setImageUrl(initial?.image ?? '');
    setSpecsText((initial?.specs || []).join(', '));
    const s = initial?.supported_os || initial?.specs || [];
    if (s.includes('windows') && s.includes('mac')) setOsChoice('both');
    else if (s.includes('windows')) setOsChoice('windows');
    else if (s.includes('mac')) setOsChoice('mac');
    else setOsChoice('both');
  }, [initial, isOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    const cat = categories.find((c) => c.slug === categorySlug);
    const osList = osChoice === 'both' ? ['windows', 'mac'] : [osChoice];
    const finalSlug = slugify(slug || name);
    const parsedSpecs = specsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const finalSpecs = parsedSpecs.length > 0 ? parsedSpecs : osList;

    if (initial) {
      onSave(
        {
          ...initial,
          name: name.trim(),
          slug: finalSlug,
          category: cat?.title ?? initial.category,
          categorySlug,
          status,
          description: description.trim(),
          image: imageUrl.trim() || undefined,
          supported_os: osList,
          specs: finalSpecs,
          faqs: initial.faqs,
        },
        false
      );
    } else {
      const empty = createEmptyDevice({
        name: name.trim(),
        slug: finalSlug,
        category: cat?.title ?? 'Umum',
        categorySlug,
        description: description.trim(),
        status,
        specs: finalSpecs,
        supported_os: osList,
      });
      empty.image = imageUrl.trim() || undefined;
      empty.supported_os = osList;
      empty.steps = [];
      empty.faqs = [];
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nama Perangkat</label>
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (isNew) setSlug(slugify(e.target.value));
              }}
              required
              placeholder="Contoh: Epson EcoTank L3250"
            />
          </div>
          <div>
            <label className={labelClass}>Slug URL</label>
            <input
              className={fieldClass}
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
              placeholder="epson-ecotank-l3250"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Kategori</label>
            <CustomSelect
              value={categorySlug}
              onChange={setCategorySlug}
              options={categories.map((c) => ({
                value: c.slug,
                label: c.title,
              }))}
              placeholder="Pilih Kategori..."
            />
          </div>
          <div>
            <label className={labelClass}>Status Perangkat</label>
            <CustomSelect
              value={status}
              onChange={(val) => setStatus(val as Device['status'])}
              options={[
                { value: 'Ready', label: 'Ready (Siap Digunakan)' },
                { value: 'Maintenance', label: 'Maintenance (Dalam Perawatan)' },
                { value: 'New', label: 'New (Perangkat Baru)' },
              ]}
            />
          </div>
          <div>
            <label className={labelClass}>Dukungan OS</label>
            <CustomSelect
              value={osChoice}
              onChange={(val) => setOsChoice(val as 'both' | 'windows' | 'mac')}
              options={[
                { value: 'both', label: 'Bisa Dua-duanya (Windows & Mac)' },
                { value: 'windows', label: 'Hanya Windows' },
                { value: 'mac', label: 'Hanya macOS' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Poin Penting / Fitur (specs, pisahkan dengan koma)</label>
          <input
            className={fieldClass}
            value={specsText}
            onChange={(e) => setSpecsText(e.target.value)}
            placeholder="Contoh: All-in-One, Wi-Fi Direct, Resolusi 4K, PIN Print"
          />
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

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-5 py-2.5 sm:py-2 text-sm sm:text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
          >
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
  const [icon, setIcon] = useState(initial?.icon ?? '');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 1);
  const [available, setAvailable] = useState(initial?.available ?? true);

  React.useEffect(() => {
    setTitle(initial?.title ?? '');
    setSlug(initial?.slug ?? '');
    setDescription(initial?.description ?? '');
    setIcon(initial?.icon ?? '');
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
        icon: icon.trim() || 'Monitor',
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
          <label className={labelClass}>Ikon Kategori</label>
          <CustomSelect
            value={icon}
            onChange={setIcon}
            options={[
              { value: 'Printer', label: 'Printer' },
              { value: 'Share2', label: 'Share2 (Sharing Dokumen / Folder)' },
              { value: 'Projector', label: 'Projector (Proyektor)' },
              { value: 'Tv', label: 'Smart TV (Televisi)' },
              { value: 'Fingerprint', label: 'Fingerprint (Mesin Absensi)' },
              { value: 'Monitor', label: 'Monitor (Layar / Display)' },
              { value: 'FileText', label: 'FileText (Dokumen Umum)' },
            ]}
            placeholder="Pilih Ikon Kategori..."
          />
        </div>
        <div>
          <label className={labelClass}>Deskripsi Kategori</label>
          <textarea className={`${fieldClass} min-h-[80px]`} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input type="checkbox" checked={available} onChange={(e) => setAvailable(e.target.checked)} />
          Tampilkan di situs publik
        </label>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-5 py-2.5 sm:py-2 text-sm sm:text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
          >
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
  onSave?: (section: DeviceSection) => Promise<void> | void;
  onSaveSteps?: (deviceId: string, steps: SetupStep[]) => Promise<void> | void;
  sectionKey?: keyof Device['sections'] | null;
}> = ({ isOpen, onClose, device, onSave, onSaveSteps, sectionKey }) => {
  const [steps, setSteps] = useState<StepRowItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supported = getDeviceSupportedOs(device);
  const hasWin = supported.includes('windows');
  const hasMac = supported.includes('mac');

  React.useEffect(() => {
    if (!device) {
      setSteps([]);
      setIsSubmitting(false);
      return;
    }
    const devSteps =
      device.steps && device.steps.length > 0
        ? device.steps
        : extractDeviceSteps(device);

    const rows: StepRowItem[] = devSteps.map((s, i) => ({
      title: s.title || `Langkah ${i + 1}`,
      description: s.description || '',
      konten_windows: hasWin ? (s.konten_windows || (s.details ? s.details.join('\n') : '')) : '',
      konten_mac: hasMac ? (s.konten_mac || (s.details ? s.details.join('\n') : '')) : '',
    }));

    setSteps(rows);
    setIsSubmitting(false);
  }, [device, isOpen, hasWin, hasMac]);

  if (!device) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalSteps: SetupStep[] = steps.map((s, i) => ({
        title: s.title.trim(),
        description: s.description.trim(),
        konten_windows: hasWin ? s.konten_windows.trim() : '',
        konten_mac: hasMac ? s.konten_mac.trim() : '',
        sort_order: i + 1,
      }));

      if (onSaveSteps) {
        await onSaveSteps(device.id, finalSteps);
      } else if (onSave) {
        const winSteps: SetupStep[] = finalSteps.map((s) => ({
          title: s.title,
          description: s.description,
          details: hasWin && s.konten_windows ? s.konten_windows.split('\n').map((l) => l.trim()).filter(Boolean) : [],
        }));
        const macSteps: SetupStep[] = finalSteps.map((s) => ({
          title: s.title,
          description: s.description,
          details: hasMac && s.konten_mac ? s.konten_mac.split('\n').map((l) => l.trim()).filter(Boolean) : [],
        }));
        await onSave({
          id: sectionKey || 'wifi',
          title: 'Panduan Alur Langkah',
          tabLabel: 'Langkah Panduan',
          iconName: 'CheckCircle2',
          osSteps: { windows: winSteps, mac: macSteps },
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        title: `Langkah ${steps.length + 1}: `,
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
      title={`Kelola Panduan Langkah: ${device.name}`}
      subtitle={`Panduan berurutan linear yang disimpan ke tabel steps di Supabase (${steps.length} langkah). ${
        hasWin && hasMac
          ? 'Mendukung Windows & macOS.'
          : hasWin
          ? 'Perangkat ini dikhususkan untuk OS Windows.'
          : 'Perangkat ini dikhususkan untuk macOS.'
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!hasMac && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
            <span>ℹ️ Perangkat <strong>{device.name}</strong> hanya mendukung OS <strong>Windows</strong>. Form input macOS dinonaktifkan secara otomatis.</span>
          </div>
        )}
        {!hasWin && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <span>ℹ️ Perangkat <strong>{device.name}</strong> hanya mendukung <strong>macOS</strong>. Form input Windows dinonaktifkan secara otomatis.</span>
          </div>
        )}

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {steps.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Belum ada langkah panduan untuk perangkat ini.
              </p>
              <p className="text-[11px] text-slate-400">
                Klik tombol "+ Tambah Langkah Baru" di bawah untuk mulai menyusun alur panduan.
              </p>
            </div>
          ) : (
            steps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Langkah #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Hapus Langkah
                  </button>
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

              {/* Kolom OS Sesuai Dukungan Perangkat */}
              <div className={`grid gap-3 pt-2 ${hasWin && hasMac ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {hasWin && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        🪟 Konten Panduan Windows (konten_windows)
                      </span>
                      {!hasMac && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                          Khusus Windows
                        </span>
                      )}
                    </label>
                    <textarea
                      className={`${fieldClass} min-h-[96px] font-mono text-[11px] leading-relaxed`}
                      value={step.konten_windows}
                      onChange={(e) => updateStep(idx, { konten_windows: e.target.value })}
                      placeholder={"1. Nyalakan printer.\n2. Hubungkan ke SSID Wi-Fi kantor.\n3. Tambahkan di Windows Settings."}
                    />
                    <span className="text-[10px] text-slate-400">Instruksi baris per baris (1, 2, 3...)</span>
                  </div>
                )}

                {hasMac && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        🍎 Konten Panduan macOS (konten_mac)
                      </span>
                      {!hasWin && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                          Khusus macOS
                        </span>
                      )}
                    </label>
                    <textarea
                      className={`${fieldClass} min-h-[96px] font-mono text-[11px] leading-relaxed`}
                      value={step.konten_mac}
                      onChange={(e) => updateStep(idx, { konten_mac: e.target.value })}
                      placeholder={"1. Nyalakan printer.\n2. Pastikan Mac terhubung ke Wi-Fi yang sama.\n3. Tambahkan via Printers & Scanners."}
                    />
                    <span className="text-[10px] text-slate-400">Instruksi baris per baris (1, 2, 3...)</span>
                  </div>
                )}
              </div>
            </div>
          )))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={addStep}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-xs font-bold rounded-xl border-2 border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-center"
          >
            + Tambah Langkah Baru
          </button>
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-5 py-2.5 sm:py-2 text-sm sm:text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Semua Langkah'}
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
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(list.filter((f) => f.question.trim() && f.answer.trim()));
              onClose();
            }}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-5 py-2.5 sm:py-2 text-sm sm:text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Tipe</label>
            <CustomSelect
              value={type}
              onChange={(val) => setType(val as MediaAsset['type'])}
              options={[
                { value: 'driver', label: 'driver' },
                { value: 'document', label: 'document' },
                { value: 'image', label: 'image' },
                { value: 'guide', label: 'guide' },
              ]}
            />
          </div>
          <div>
            <label className={labelClass}>OS</label>
            <CustomSelect
              value={targetOs}
              onChange={(val) => setTargetOs(val as MediaAsset['targetOs'])}
              options={[
                { value: 'all', label: 'all (semua)' },
                { value: 'windows', label: 'windows' },
                { value: 'mac', label: 'mac' },
              ]}
            />
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
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-5 py-2.5 sm:py-2 text-sm sm:text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
          >
            Simpan Media
          </button>
        </div>
      </form>
    </CrudModal>
  );
};

export const SingleStepModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  initial?: SetupStep | null;
  preselectedDeviceId?: string;
  onSave: (step: SetupStep, isNew: boolean) => Promise<void> | void;
}> = ({ isOpen, onClose, devices, initial, preselectedDeviceId, onSave }) => {
  const isNew = !initial;

  const resolveTargetDeviceId = (idOrSlug?: string | null): string => {
    if (!idOrSlug) return devices[0]?.id || '';
    const match = devices.find((d) => d.id === idOrSlug || d.slug === idOrSlug);
    if (match) return match.id;
    return idOrSlug;
  };

  const [deviceId, setDeviceId] = useState(() =>
    resolveTargetDeviceId(initial?.device_id || preselectedDeviceId || devices[0]?.id || '')
  );
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [kontenWindows, setKontenWindows] = useState(
    initial?.konten_windows || (initial?.details ? initial.details.join('\n') : '')
  );
  const [kontenMac, setKontenMac] = useState(
    initial?.konten_mac || (initial?.details ? initial.details.join('\n') : '')
  );
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDevice = devices.find((d) => d.id === deviceId);
  const supported = getDeviceSupportedOs(currentDevice);
  const hasWin = supported.includes('windows');
  const hasMac = supported.includes('mac');

  React.useEffect(() => {
    setDeviceId(resolveTargetDeviceId(initial?.device_id || preselectedDeviceId || devices[0]?.id || ''));
    setTitle(initial?.title ?? '');
    setDescription(initial?.description ?? '');
    setKontenWindows(initial?.konten_windows || (initial?.details ? initial.details.join('\n') : ''));
    setKontenMac(initial?.konten_mac || (initial?.details ? initial.details.join('\n') : ''));
    setSortOrder(initial?.sort_order ?? 1);
    setIsSubmitting(false);
  }, [initial, preselectedDeviceId, devices, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deviceId) return;
    setIsSubmitting(true);
    try {
      await onSave(
        {
          id: initial?.id,
          device_id: deviceId,
          title: title.trim(),
          description: description.trim(),
          konten_windows: hasWin ? kontenWindows.trim() : '',
          konten_mac: hasMac ? kontenMac.trim() : '',
          sort_order: Number(sortOrder) || 1,
        },
        isNew
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? 'Tambah Langkah Panduan' : 'Ubah Langkah Panduan'}
      subtitle={`Panduan alur linear langkah demi langkah untuk perangkat tertentu. ${
        hasWin && hasMac
          ? 'Mendukung Windows & macOS.'
          : hasWin
          ? 'Perangkat ini dikhususkan untuk OS Windows.'
          : 'Perangkat ini dikhususkan untuk macOS.'
      }`}
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Target Perangkat</label>
            <CustomSelect
              value={deviceId}
              onChange={setDeviceId}
              options={devices.map((d) => ({
                value: d.id,
                label: d.name,
                sublabel: d.category,
              }))}
              placeholder="Pilih Perangkat Target..."
            />
          </div>
          <div>
            <label className={labelClass}>Urutan Langkah (1, 2, ...)</label>
            <input
              type="number"
              className={fieldClass}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={1}
              required
            />
          </div>
        </div>

        {!hasMac && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs flex items-center gap-2">
            <span>ℹ️ Perangkat <strong>{currentDevice?.name}</strong> hanya mendukung OS <strong>Windows</strong>. Form input macOS dinonaktifkan secara otomatis.</span>
          </div>
        )}
        {!hasWin && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <span>ℹ️ Perangkat <strong>{currentDevice?.name}</strong> hanya mendukung <strong>macOS</strong>. Form input Windows dinonaktifkan secara otomatis.</span>
          </div>
        )}

        <div>
          <label className={labelClass}>Judul Langkah</label>
          <input
            className={fieldClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Contoh: Langkah 1: Hubungkan Printer ke Wi-Fi Kantor"
          />
        </div>

        <div>
          <label className={labelClass}>Deskripsi Ringkas</label>
          <textarea
            className={`${fieldClass} min-h-[60px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Penjelasan singkat tujuan atau hal penting di langkah ini."
          />
        </div>

        <div className={`grid gap-4 pt-1 ${hasWin && hasMac ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {hasWin && (
            <div className="space-y-1.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <span>Panduan Windows</span>
                  {!hasMac && (
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      Khusus Windows
                    </span>
                  )}
                </label>
                <span className="text-[10px] text-slate-400">Gunakan baris baru untuk sub-langkah</span>
              </div>
              <textarea
                className={`${fieldClass} min-h-[120px] font-mono text-sm sm:text-xs leading-relaxed`}
                value={kontenWindows}
                onChange={(e) => setKontenWindows(e.target.value)}
                placeholder="1. Buka Settings > Devices & Printers&#10;2. Klik Add Printer & Scanner&#10;3. Pilih printer dari daftar Wi-Fi"
              />
            </div>
          )}

          {hasMac && (
            <div className="space-y-1.5 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span>Panduan macOS</span>
                  {!hasWin && (
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      Khusus macOS
                    </span>
                  )}
                </label>
                <span className="text-[10px] text-slate-400">Gunakan baris baru untuk sub-langkah</span>
              </div>
              <textarea
                className={`${fieldClass} min-h-[120px] font-mono text-sm sm:text-xs leading-relaxed`}
                value={kontenMac}
                onChange={(e) => setKontenMac(e.target.value)}
                placeholder="1. Buka Apple Menu > System Settings > Printers & Scanners&#10;2. Klik Add Printer (+)...&#10;3. Hubungkan via AirPrint atau Bonjour"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-5 py-2.5 sm:py-2 text-sm sm:text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? 'Menyimpan...' : isNew ? 'Tambah Langkah' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </CrudModal>
  );
};

export const SingleFaqModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  devices: Device[];
  initial?: FAQItem | null;
  preselectedDeviceId?: string | null;
  onSave: (faq: FAQItem, isNew: boolean) => Promise<void> | void;
}> = ({ isOpen, onClose, devices, initial, preselectedDeviceId, onSave }) => {
  const isNew = !initial;

  const resolveTargetDeviceId = (idOrSlug?: string | null): string => {
    if (!idOrSlug) return '';
    const match = devices.find((d) => d.id === idOrSlug || d.slug === idOrSlug);
    if (match) return match.id;
    return idOrSlug;
  };

  const [deviceId, setDeviceId] = useState<string>(() =>
    resolveTargetDeviceId(initial ? (initial.device_id || '') : (preselectedDeviceId || ''))
  );
  const [question, setQuestion] = useState(initial?.question ?? '');
  const [answer, setAnswer] = useState(initial?.answer ?? '');
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    setDeviceId(resolveTargetDeviceId(initial ? (initial.device_id || '') : (preselectedDeviceId || '')));
    setQuestion(initial?.question ?? '');
    setAnswer(initial?.answer ?? '');
    setSortOrder(initial?.sort_order ?? 1);
    setIsSubmitting(false);
  }, [initial, preselectedDeviceId, devices, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setIsSubmitting(true);
    try {
      await onSave(
        {
          id: initial?.id,
          device_id: deviceId || null,
          question: question.trim(),
          answer: answer.trim(),
          sort_order: Number(sortOrder) || 1,
        },
        isNew
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? 'Tambah FAQ' : 'Ubah FAQ'}
      subtitle="Pertanyaan & jawaban bantuan. Tersimpan langsung ke database Supabase."
      wide
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Target FAQ</label>
            <CustomSelect
              value={deviceId}
              onChange={setDeviceId}
              options={[
                { value: '', label: 'FAQ Umum (Beranda)', sublabel: 'Tampil di Halaman Beranda Utama' },
                ...devices.map((d) => ({
                  value: d.id,
                  label: d.name,
                  sublabel: `Perangkat • ${d.category}`,
                })),
              ]}
              placeholder="Pilih Target FAQ..."
            />
          </div>
          <div>
            <label className={labelClass}>Urutan Tampil (sort_order)</label>
            <input
              type="number"
              className={fieldClass}
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={1}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Pertanyaan (Question)</label>
          <input
            className={fieldClass}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            placeholder="Contoh: Bagaimana jika printer tidak terdeteksi di Wi-Fi?"
          />
        </div>

        <div>
          <label className={labelClass}>Jawaban Solusi (Answer)</label>
          <textarea
            className={`${fieldClass} min-h-[120px]`}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
            placeholder="Tuliskan solusi langkah demi langkah secara jelas..."
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 text-sm sm:text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-5 py-2.5 sm:py-2 text-sm sm:text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 shadow-md shadow-blue-600/25 active:scale-[0.98] transition-all"
          >
            {isSubmitting ? 'Menyimpan...' : isNew ? 'Tambah FAQ' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </CrudModal>
  );
};
