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
  const [status, setStatus] = useState<Device['status']>(initial?.status ?? 'New');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [specsText, setSpecsText] = useState(initial?.specs.join(', ') ?? '');

  React.useEffect(() => {
    setName(initial?.name ?? '');
    setCategorySlug(initial?.categorySlug ?? categories[0]?.slug ?? '');
    setStatus(initial?.status ?? 'New');
    setDescription(initial?.description ?? '');
    setSpecsText(initial?.specs.join(', ') ?? '');
  }, [initial, isOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;
    const cat = categories.find((c) => c.slug === categorySlug);
    const specs = specsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (initial) {
      onSave(
        {
          ...initial,
          name: name.trim(),
          category: cat?.title ?? initial.category,
          categorySlug,
          status,
          description: description.trim(),
          specs,
        },
        false
      );
    } else {
      onSave(
        createEmptyDevice({
          name: name.trim(),
          category: cat?.title ?? 'Umum',
          categorySlug,
          description: description.trim(),
          status,
          specs,
        }),
        true
      );
    }
    onClose();
  };

  return (
    <CrudModal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? 'Tambah Perangkat' : 'Ubah Perangkat'}
      subtitle="Data ini tampil di situs publik setelah disimpan."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Nama perangkat</label>
          <input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
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
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={fieldClass}
              value={status}
              onChange={(e) => setStatus(e.target.value as Device['status'])}
            >
              <option value="Ready">Ready</option>
              <option value="Maintenance">Maintenance</option>
              <option value="New">New</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Deskripsi</label>
          <textarea
            className={`${fieldClass} min-h-[88px]`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Spesifikasi (pisahkan dengan koma)</label>
          <input className={fieldClass} value={specsText} onChange={(e) => setSpecsText(e.target.value)} />
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
  const [available, setAvailable] = useState(initial?.available ?? true);

  React.useEffect(() => {
    setTitle(initial?.title ?? '');
    setSlug(initial?.slug ?? '');
    setDescription(initial?.description ?? '');
    setIcon(initial?.icon ?? 'Monitor');
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
          <label className={labelClass}>Nama kategori</label>
          <input
            className={fieldClass}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (isNew) setSlug(slugify(e.target.value));
            }}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Slug URL</label>
          <input className={fieldClass} value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Ikon (Printer, Share2, Projector, Tv, Fingerprint, Monitor)</label>
          <input className={fieldClass} value={icon} onChange={(e) => setIcon(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Deskripsi</label>
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
            Simpan
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
  const [windows, setWindows] = useState<SetupStep[]>(section?.osSteps?.windows ?? section?.steps ?? []);
  const [mac, setMac] = useState<SetupStep[]>(section?.osSteps?.mac ?? []);

  React.useEffect(() => {
    setTitle(section?.title ?? '');
    setTabLabel(section?.tabLabel ?? '');
    setWindows(section?.osSteps?.windows ?? section?.steps ?? []);
    setMac(section?.osSteps?.mac ?? []);
  }, [section, isOpen]);

  if (!section) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...section,
      title,
      tabLabel,
      osSteps: { windows, mac },
      steps: undefined,
    });
    onClose();
  };

  return (
    <CrudModal
      wide
      isOpen={isOpen}
      onClose={onClose}
      title={`Ubah panduan: ${section.title}`}
      subtitle={device?.name}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Judul modul</label>
            <input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Label tab</label>
            <input className={fieldClass} value={tabLabel} onChange={(e) => setTabLabel(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-bold mb-2">Windows</h3>
            <StepFields steps={windows} onChange={setWindows} />
          </div>
          <div>
            <h3 className="text-xs font-bold mb-2">macOS</h3>
            <StepFields steps={mac} onChange={setMac} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700">
            Batal
          </button>
          <button type="submit" className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white">
            Simpan panduan
          </button>
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
