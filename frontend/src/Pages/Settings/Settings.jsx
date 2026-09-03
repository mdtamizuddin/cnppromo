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
  GiftIcon,
  ClockIcon,
  ClipboardDocumentCheckIcon,
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
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyMsg, setNotifyMsg] = useState("");
  const [notifying, setNotifying] = useState(false);

  // Marketplace config lives on a SEPARATE authenticated endpoint
  // (/tasks/admin/config), never on the public /setting response — that is
  // what keeps the commission rate from ever reaching a worker's browser.
  // It therefore gets its own load/save cycle, independent of the tabs above.
  const [marketplace, setMarketplaceState] = useState(null);
  const [marketplaceInitial, setMarketplaceInitial] = useState(null);
  const [marketplaceSaving, setMarketplaceSaving] = useState(false);

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
    (async () => {
      try {
        const res = await api.get('tasks/admin/config');
        setMarketplaceState(res.data || {});
        setMarketplaceInitial(res.data || {});
      } catch (error) {
        // Non-fatal — the rest of the settings page still works.
      }
    })();
  }, []);

  const marketplaceDirty = useMemo(
    () => JSON.stringify(marketplace) !== JSON.stringify(marketplaceInitial),
    [marketplace, marketplaceInitial]
  );
  const setMarketplace = (key, value) => setMarketplaceState((m) => ({ ...m, [key]: value }));

  const saveMarketplace = async () => {
    if (!marketplaceDirty) return;
    try {
      setMarketplaceSaving(true);
      const res = await api.put('tasks/admin/config', marketplace);
      setMarketplaceState(res.data);
      setMarketplaceInitial(res.data);
      toast.success("Marketplace settings updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Something went wrong");
    } finally {
      setMarketplaceSaving(false);
    }
  };

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

  const buildBonusMsg = () => {
    const amt = (Number(bonus.amount) || 0).toLocaleString("en-US");
    const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;
    const start = fmt(bonus.startDate);
    const end = fmt(bonus.endDate);
    const rangeMsg = start && end ? `, ${start} থেকে ${end} পর্যন্ত বৈধ` : start ? `, ${start} থেকে শুরু` : end ? `, ${end} পর্যন্ত বৈধ` : "";
    return `অভিনন্দন! আপনি ৳${amt} বোনাস পেয়েছেন${rangeMsg}। আপনার ড্যাশবোর্ড ব্যালেন্স দেখুন!`;
  };

  const notifyAllUsers = async () => {
    const finalMsg = notifyMsg.trim() || buildBonusMsg();
    try {
      setNotifying(true);
      const res = await api.post("/notification/broadcast", {
        title: `🎁 নতুন বোনাস: ৳${(Number(bonus.amount) || 0).toLocaleString("en-US")}`,
        message: finalMsg,
        category: "reward",
        target: "all",
      });
      toast.success(res.data?.message || "Notification sent to all users");
      setNotifyOpen(false);
      setNotifyMsg("");
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to send notification");
    } finally {
      setNotifying(false);
    }
  };

  if (loading || !settings) {
    return <Loader />;
  }

  const bonus = settings?.bonus || {};
  const bonusDirty = !!(settings?.bonus) && JSON.stringify({ amount: bonus.amount, active: bonus.active, startDate: bonus.startDate || null, endDate: bonus.endDate || null }) !==
    JSON.stringify({ amount: initial?.bonus?.amount, active: initial?.bonus?.active, startDate: initial?.bonus?.startDate || null, endDate: initial?.bonus?.endDate || null });

  const setBonus = (value) => set("bonus", { ...bonus, ...value });
  const defaultStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };
  const setBonusDuration = (days) => {
    const start = bonus.startDate ? new Date(bonus.startDate) : new Date(defaultStart());
    if (!days) {
      setBonus({ startDate: start.toISOString(), endDate: null });
      return;
    }
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    setBonus({ startDate: start.toISOString(), endDate: end.toISOString() });
  };
  const endBonusNow = () => {
    setBonus({ amount: 0, active: false, startDate: null, endDate: null });
  };

  const bonusStatus = (() => {
    const now = new Date();
    if (!bonus.active) return { label: "Inactive", cls: "text-gray-500 bg-gray-100" };
    if (bonus.startDate && new Date(bonus.startDate) > now) return { label: "Scheduled", cls: "text-blue-600 bg-blue-100" };
    if (bonus.endDate && new Date(bonus.endDate) < now) return { label: "Expired", cls: "text-red-600 bg-red-100" };
    return { label: "Active", cls: "text-emerald-600 bg-emerald-100" };
  })();

  const durationDays = (() => {
    if (!bonus.startDate || !bonus.endDate) return bonus.active ? "permanent" : "";
    const days = Math.round((new Date(bonus.endDate) - new Date(bonus.startDate)) / (1000 * 60 * 60 * 24));
    return days > 0 ? String(days) : "";
  })();

  const tabs = [
    { key: "general", label: "General", icon: Cog6ToothIcon },
    { key: "referral", label: "Referral Commission", icon: UserGroupIcon },
    { key: "accounts", label: "Support Accounts", icon: PhoneIcon },
    { key: "links", label: "Community Links", icon: LinkIcon },
    { key: "bonus", label: "Bonus", icon: GiftIcon },
    { key: "marketplace", label: "Marketplace", icon: ClipboardDocumentCheckIcon },
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
              <InputFeild label="Support Messenger" type="text" value={settings?.links?.supportMessanger}
                onChange={(e) => setNested("links", "supportMessanger", e.target.value)} variant="outlined" />
            </div>
          </div>
        </TableCard>
      )}

      {/* ── BONUS ──────────────────────────────────────── */}
      {activeTab === "bonus" && (
        <TableCard>
          <div className="p-5 sm:p-6 space-y-5">
            <SectionTitle icon={GiftIcon} title="Global Bonus"
              subtitle="A display-only bonus shown to every user alongside their main balance" />

            <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 ring-1 ring-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-800">Bonus Active</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {bonusStatus.label === "Active"
                    ? `Shown to all users as ৳${(Number(bonus.amount) || 0).toLocaleString()}`
                    : bonusStatus.label === "Scheduled"
                      ? "Bonus is scheduled to start and becomes visible at start date"
                      : bonusStatus.label === "Expired"
                        ? "Bonus period has ended — set a new amount to re-activate"
                        : "Bonus is currently not shown to users"}
                </p>
              </div>
              <Switch id="bonus-active" color="green" checked={!!bonus.active}
                onChange={(e) => setBonus({ active: e.target.checked })} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InputFeild label="Bonus Amount (৳)" type="number"
                value={bonus.amount ?? 0}
                onChange={(e) => setBonus({ amount: Number(e.target.value) || 0 })}
                variant="outlined" />
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Duration</label>
                <select
                  value={durationDays}
                  onChange={(e) => setBonusDuration(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                >
                  <option value="">Permanent (no expiry)</option>
                  <option value="1">1 day</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={bonus.startDate ? new Date(bonus.startDate).toISOString().slice(0, 10) : ""}
                  onChange={(e) => {
                    if (!e.target.value) { setBonus({ startDate: null }); return; }
                    const d = new Date(e.target.value);
                    d.setHours(0, 0, 0, 0);
                    const end = bonus.endDate ? new Date(bonus.endDate) : null;
                    if (end && end < d) { setBonus({ endDate: new Date(d).toISOString() }); }
                    setBonus({ startDate: d.toISOString() });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">End Date</label>
                <input
                  type="date"
                  min={bonus.startDate ? new Date(bonus.startDate).toISOString().slice(0, 10) : ""}
                  value={bonus.endDate ? new Date(bonus.endDate).toISOString().slice(0, 10) : ""}
                  onChange={(e) => {
                    if (!e.target.value) { setBonus({ endDate: null }); return; }
                    const d = new Date(e.target.value);
                    d.setHours(23, 59, 59, 999);
                    setBonus({ endDate: d.toISOString() });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>
            </div>

            {(bonus.startDate || bonus.endDate) && (
              <p className="text-[11px] text-gray-400">
                <ClockIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                {bonus.startDate && <>Starts: {new Date(bonus.startDate).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</>}
                {bonus.startDate && bonus.endDate && "  ·  "}
                {bonus.endDate && <>Ends: {new Date(bonus.endDate).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</>}
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${bonusStatus.cls}`}>
                {bonusStatus.label}
              </span>
              {bonusDirty && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                  <ExclamationCircleIcon className="w-4 h-4" /> Unsaved bonus changes
                </span>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-4">
              <div>
                <Button
                  size="sm"
                  variant="outlined"
                  color="red"
                  onClick={endBonusNow}
                  className="normal-case text-xs font-bold px-5 py-2.5 rounded-xl"
                >
                  End Bonus Now (Set to 0)
                </Button>
                <p className="text-[11px] text-gray-400 mt-2">
                  Ends the bonus immediately, sets the amount to 0 and hides it from all users. Remember to save.
                </p>
              </div>

              <div>
                <Button
                  size="sm"
                  color="amber"
                  onClick={() => {
                    if (!notifyOpen) {
                      setNotifyMsg(buildBonusMsg());
                    }
                    setNotifyOpen((o) => !o);
                  }}                  disabled={notifying || (Number(bonus.amount) || 0) <= 0}
                  className="normal-case text-xs font-bold px-5 py-2.5 rounded-xl"
                >
                  {notifying ? "Sending…" : "Notify All Users About Bonus"}
                </Button>
                <p className="text-[11px] text-gray-400 mt-2">
                  Sends a bonus notification to all users (respects user opt-outs). Saves are not required first.
                </p>
              </div>

              {notifyOpen && (
                <div className="rounded-2xl bg-gray-50 ring-1 ring-gray-100 p-4 space-y-3">
                  <label className="block text-sm text-gray-700">Notification Message</label>
                  <Textarea
                    label="Message (optional)"
                    type="text"
                    name="notifyMsg"
                    value={notifyMsg}
                    onChange={(e) => setNotifyMsg(e.target.value)}
                    variant="outlined"
                    rows={3}
                    placeholder={buildBonusMsg()}
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="text" color="gray" onClick={() => setNotifyOpen(false)} className="normal-case text-xs font-bold">
                      Cancel
                    </Button>
                    <Button size="sm" color="amber" onClick={notifyAllUsers} disabled={notifying} className="normal-case text-xs font-bold px-4 py-2 rounded-lg">
                      {notifying ? "Sending…" : "Send to All Users"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TableCard>
      )}

      {/* ── MARKETPLACE ────────────────────────────────── */}
      {activeTab === "marketplace" && (
        <TableCard>
          <div className="p-5 sm:p-6 space-y-5">
            <SectionTitle icon={ClipboardDocumentCheckIcon} title="Task Marketplace"
              subtitle="Commission rate and timing rules. Never exposed to the public /setting endpoint — workers and providers cannot see the rate." />

            {!marketplace ? (
              <p className="text-xs text-gray-400">Loading…</p>
            ) : (
              <>
                <ToggleRow id="mp-enabled" label="Marketplace Enabled" checked={marketplace.enabled}
                  onChange={(c) => setMarketplace("enabled", c)} />

                <div className="grid sm:grid-cols-2 gap-4">
                  <InputFeild label="Commission Rate (%)" type="number" value={marketplace.commissionRate ?? ""}
                    onChange={(e) => setMarketplace("commissionRate", Number(e.target.value))} variant="outlined" />
                  <InputFeild label="Auto-Approve After (hours)" type="number" value={marketplace.autoApproveHours ?? ""}
                    onChange={(e) => setMarketplace("autoApproveHours", Number(e.target.value))} variant="outlined" />
                  <InputFeild label="Report Window (hours)" type="number" value={marketplace.reportWindowHours ?? ""}
                    onChange={(e) => setMarketplace("reportWindowHours", Number(e.target.value))} variant="outlined" />
                  <InputFeild label="Max Submission Attempts" type="number" value={marketplace.maxAttempts ?? ""}
                    onChange={(e) => setMarketplace("maxAttempts", Number(e.target.value))} variant="outlined" />
                </div>

                <p className="text-[11px] text-gray-400">
                  <ShieldCheckIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                  Changing the commission rate only affects tasks created after the change — in-flight tasks keep the rate they were created with.
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    onClick={saveMarketplace}
                    disabled={!marketplaceDirty || marketplaceSaving}
                    className={`normal-case text-xs font-bold px-5 py-2.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {marketplaceSaving ? "Saving…" : "Save Marketplace Settings"}
                  </Button>
                  {marketplaceDirty && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                      <ExclamationCircleIcon className="w-4 h-4" /> Unsaved changes
                    </span>
                  )}
                </div>
              </>
            )}
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
