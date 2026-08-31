import React, { useEffect, useMemo, useState } from 'react';
import { Button, Switch, Textarea } from '@material-tailwind/react';
import {
  Cog6ToothIcon,
  BanknotesIcon,
  UserGroupIcon,
  LinkIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { api } from '../../util/axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setSettings as setReduxSettings } from '../../redux/features/user/userSlice';
import Loader from '../../Components/Loader';
import {
  PageHeader, TableCard, StatGrid, StatCard, ACCENTS, SegmentedTabs,
} from '../../Components/AdminLayout/_Ui/AdminUI';
import InputFeild from '../Auth/InputFeild';

const ACCENT = ACCENTS.blue;

const genLabel = (n) =>
  ["সরাসরি (1st)", "2nd", "3rd", "4th", "5th", "6th"][n - 1] || `Generation ${n}`;

const Settings = () => {
  const dispatch = useDispatch();
  const [initial, setInitial] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/setting');
        const data = res.data?.setting || {};
        setSettings(data);
        setInitial(data);
      } catch (error) {
        toast.error(error?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initial),
    [settings, initial]
  );

  const set = (path, value) => setSettings((s) => ({ ...s, [path]: value }));
  const setNested = (parent, key, value) =>
    setSettings((s) => ({ ...s, [parent]: { ...s?.[parent], [key]: value } }));

  const saveSettings = async () => {
    if (!dirty) return;
    try {
      setSaving(true);
      // Only send the whole object — the backend whitelists + merges safely.
      const res = await api.put('/setting', settings);
      const saved = res.data?.setting || settings;
      setSettings(saved);
      setInitial(saved);
      dispatch(setReduxSettings(saved));
      toast.success("Settings updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <Loader />;
  }

  const tabs = [
    { key: "general", label: "General", icon: Cog6ToothIcon },
    { key: "referral", label: "Referral Commission", icon: UserGroupIcon },
    { key: "accounts", label: "Support Accounts", icon: PhoneIcon },
    { key: "links", label: "Community Links", icon: LinkIcon },
  ];

  return (
    <div className="w-full pb-10">
      <PageHeader
        icon={Cog6ToothIcon}
        accent="blue"
        title="Site Settings"
        subtitle="Configure site identity, referral commissions, support accounts and community links."
        action={
          <Button
            size="sm"
            onClick={saveSettings}
            disabled={!dirty || saving}
            className={`normal-case text-xs font-bold px-5 py-2.5 flex items-center gap-1.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Saving…</>
            ) : !dirty ? (
              <><CheckCircleIcon className="w-4 h-4" /> Saved</>
            ) : (
              <><BanknotesIcon className="w-4 h-4" /> Save Changes</>
            )}
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          title="Refer Levels"
          value={6}
          hint="commission tiers"
          icon={UserGroupIcon}
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
        />
        <StatCard
          title="Registration"
          value={settings?.register ? "On" : "Off"}
          hint="open to new users"
          icon={ShieldCheckIcon}
          colorClass="text-amber-500"
          bgClass="bg-amber-50"
        />
        <StatCard
          title="Withdrawal"
          value={settings?.withdraw ? "On" : "Off"}
          hint="enabled for users"
          icon={BanknotesIcon}
          colorClass="text-purple-500"
          bgClass="bg-purple-50"
        />
        <StatCard
          title="Activation Fee"
          value={settings?.acAmm || "—"}
          hint="account activation"
          icon={CurrencyDollarIcon}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50"
        />
      </StatGrid>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <SegmentedTabs
          tabs={tabs.map((t) => ({ key: t.key, label: t.label }))}
          value={activeTab}
          onChange={setActiveTab}
          accent="blue"
        />
        {dirty && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
            <ExclamationCircleIcon className="w-4 h-4" />
            Unsaved changes
          </span>
        )}
      </div>

      {/* ── GENERAL ─────────────────────────────────────── */}
      {activeTab === "general" && (
        <TableCard>
          <div className="p-5 sm:p-6 space-y-4">
            <SectionTitle icon={Cog6ToothIcon} title="Site Identity & Behaviour" />
            <Textarea
              label="Notice"
              type="text"
              name="notice"
              value={settings?.notice}
              onChange={(e) => set("notice", e.target.value)}
              variant="outlined"
              rows={3}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <InputFeild label="Site Name" type="text" value={settings?.siteName}
                onChange={(e) => set("siteName", e.target.value)} variant="outlined" />
              <InputFeild label="Site Logo URL" type="text" value={settings?.siteLogo}
                onChange={(e) => set("siteLogo", e.target.value)} variant="outlined" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <InputFeild label="Active Fee (৳)" type="text" value={settings?.acAmm}
                onChange={(e) => set("acAmm", e.target.value)} variant="outlined" />
              <InputFeild label="How-to Video Link" type="text" value={settings?.ht_video}
                onChange={(e) => set("ht_video", e.target.value)} variant="outlined" />
            </div>
            <InputFeild label="Copyright" type="text" value={settings?.copyright}
              onChange={(e) => set("copyright", e.target.value)} variant="outlined" />
            <div className="grid grid-cols-2 gap-4 pt-1">
              <ToggleRow id="reg" label="Register" checked={settings?.register}
                onChange={(c) => set("register", c)} />
              <ToggleRow id="wd" label="Withdraw" checked={settings?.withdraw}
                onChange={(c) => set("withdraw", c)} />
            </div>
          </div>
        </TableCard>
      )}

      {/* ── REFERRAL COMMISSION ─────────────────────────── */}
      {activeTab === "referral" && (
        <TableCard>
          <div className="p-5 sm:p-6 space-y-4">
            <SectionTitle icon={UserGroupIcon} title="Referral Commission Tiers"
              subtitle="Commission % earned by each upline generation on activation" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <InputFeild
                  key={n}
                  label={`${genLabel(n)} (gen${n})`}
                  type="number"
                  value={settings?.ref_comm?.[`gen${n}`] ?? ""}
                  onChange={(e) => setNested("ref_comm", `gen${n}`, Number(e.target.value))}
                  variant="outlined"
                />
              ))}
            </div>
          </div>
        </TableCard>
      )}

      {/* ── SUPPORT ACCOUNTS ────────────────────────────── */}
      {activeTab === "accounts" && (
        <TableCard>
          <div className="p-5 sm:p-6 space-y-4">
            <SectionTitle icon={PhoneIcon} title="Support Accounts"
              subtitle="Public contact numbers surfaced to users across the site" />
            <div className="grid sm:grid-cols-2 gap-4">
              <InputFeild label="Support Phone" type="text" value={settings?.accounts?.phone}
                onChange={(e) => setNested("accounts", "phone", e.target.value)} variant="outlined" />
              <InputFeild label="Support WhatsApp" type="text" value={settings?.accounts?.whatsapp}
                onChange={(e) => setNested("accounts", "whatsapp", e.target.value)} variant="outlined" />
              <InputFeild label="Support Email" type="text" value={settings?.accounts?.email}
                onChange={(e) => setNested("accounts", "email", e.target.value)} variant="outlined" />
              <InputFeild label="bKash" type="text" value={settings?.accounts?.bkash}
                onChange={(e) => setNested("accounts", "bkash", e.target.value)} variant="outlined" />
              <InputFeild label="Nagad" type="text" value={settings?.accounts?.nagad}
                onChange={(e) => setNested("accounts", "nagad", e.target.value)} variant="outlined" />
              <InputFeild label="Rocket" type="text" value={settings?.accounts?.rocket}
                onChange={(e) => setNested("accounts", "rocket", e.target.value)} variant="outlined" />
              <InputFeild label="Upay" type="text" value={settings?.accounts?.upay}
                onChange={(e) => setNested("accounts", "upay", e.target.value)} variant="outlined" />
              <InputFeild label="Payeer" type="text" value={settings?.accounts?.payeer}
                onChange={(e) => setNested("accounts", "payeer", e.target.value)} variant="outlined" />
            </div>
            <p className="text-[11px] text-gray-400">
              <ShieldCheckIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
              Payment method numbers are also synced automatically from the Payment Gateway page.
            </p>
          </div>
        </TableCard>
      )}

      {/* ── COMMUNITY LINKS ─────────────────────────────── */}
      {activeTab === "links" && (
        <TableCard>
          <div className="p-5 sm:p-6 space-y-4">
            <SectionTitle icon={LinkIcon} title="Community Links"
              subtitle="Social channels and resources shared with users" />
            <div className="grid sm:grid-cols-2 gap-4">
              <InputFeild label="Facebook Page" type="text" value={settings?.links?.page}
                onChange={(e) => setNested("links", "page", e.target.value)} variant="outlined" />
              <InputFeild label="Facebook Group" type="text" value={settings?.links?.facebook}
                onChange={(e) => setNested("links", "facebook", e.target.value)} variant="outlined" />
              <InputFeild label="Telegram" type="text" value={settings?.links?.telegram}
                onChange={(e) => setNested("links", "telegram", e.target.value)} variant="outlined" />
              <InputFeild label="WhatsApp Group" type="text" value={settings?.links?.whatsapp}
                onChange={(e) => setNested("links", "whatsapp", e.target.value)} variant="outlined" />
              <InputFeild label="Promo Video Link" type="text" value={settings?.links?.video}
                onChange={(e) => setNested("links", "video", e.target.value)} variant="outlined" />
            </div>
          </div>
        </TableCard>
      )}

      {/* Sticky footer save bar */}
      <div className="sticky bottom-4 mt-6 rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow-lg p-3 flex items-center justify-between gap-3">
        <span className="text-[11px] text-gray-500 px-2">
          {dirty ? (
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <ExclamationCircleIcon className="w-4 h-4" /> Unsaved changes
            </span>
          ) : (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4" /> All changes saved
            </span>
          )}
        </span>
        <Button
          size="sm"
          onClick={saveSettings}
          disabled={!dirty || saving}
          className={`normal-case text-xs font-bold px-6 py-2.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Saving…</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3">
    <div className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-blue-50">
      <Icon className="w-5 h-5 text-blue-600" strokeWidth={1.8} />
    </div>
    <div className="min-w-0">
      <h2 className="text-sm font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const ToggleRow = ({ id, label, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 ring-1 ring-gray-100">
    <label htmlFor={id} className="text-sm text-gray-700">{label}</label>
    <Switch id={id} color="green" checked={!!checked}
      onChange={(e) => onChange(e.target.checked)} />
  </div>
);

export default Settings;
