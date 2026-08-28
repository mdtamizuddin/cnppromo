import React, { useEffect } from 'react';
import { Button, Switch, Textarea } from '@material-tailwind/react';
import { Cog6ToothIcon, BanknotesIcon, UserGroupIcon, LinkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { api } from '../../util/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Loader from '../../Components/Loader';
import {
  PageHeader, TableCard, StatGrid, StatCard, ACCENTS,
} from '../../Components/AdminLayout/_Ui/AdminUI';
import InputFeild from '../Auth/InputFeild';

const ACCENT = ACCENTS.blue;

const SectionCard = ({ icon: Icon, title, subtitle, children }) => (
  <TableCard>
    <div className="p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-blue-50">
          <Icon className="w-5 h-5 text-blue-600" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  </TableCard>
);

const Settings = () => {
    const { user } = useSelector(state => state.user)
    const [settings, setSettings] = React.useState(null)
    const [loading, setLoading] = React.useState(false)

    useEffect(() => {
        try {
            api.get('/setting')
                .then(res => setSettings(res.data?.setting || {}))
        } catch (error) {
            console.log(error);
        }
    }, [user])

    const updateProfile = async (e) => {
        e?.preventDefault?.()
        try {
            setLoading(true)
            const res = await api.put('/setting', settings);
            toast.success("Settings Updated")
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    if (!settings) {
        return <Loader />
    }

    const set = (path, value) => setSettings({ ...settings, [path]: value });
    const setNested = (parent, key, value) =>
        setSettings({ ...settings, [parent]: { ...settings?.[parent], [key]: value } });

    const gen = (n) => settings?.ref_comm?.[`gen${n}`];

    return (
        <div className="w-full pb-10">
            <PageHeader
                icon={Cog6ToothIcon}
                accent="blue"
                title="Site Settings"
                subtitle="Configure site-wide information, referral commissions, and community links."
                action={
                    <Button
                        size="sm"
                        onClick={updateProfile}
                        disabled={loading}
                        className={`normal-case text-xs font-bold px-5 py-2.5 flex items-center gap-1.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow}`}
                    >
                        {loading ? "Saving…" : "Save All Changes"}
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
            </StatGrid>

            <div className="grid lg:grid-cols-2 gap-5 sm:gap-6">
                {/* ── Basic Info ─────────────────────────────────── */}
                <SectionCard icon={Cog6ToothIcon} title="Basic Info" subtitle="Site identity and global behaviour">
                    <Textarea
                        label="Notice"
                        type="text"
                        name="notice"
                        value={settings?.notice}
                        onChange={(e) => set("notice", e.target.value)}
                        variant="outlined"
                        rows={3}
                    />
                    <InputFeild
                        label="Site Name"
                        type="text"
                        name="siteName"
                        value={settings?.siteName}
                        onChange={(e) => set("siteName", e.target.value)}
                        variant="outlined"
                    />
                    <InputFeild
                        label="Site Logo"
                        type="text"
                        name="siteLogo"
                        value={settings?.siteLogo}
                        variant="outlined"
                        onChange={(e) => set("siteLogo", e.target.value)}
                    />
                    <InputFeild
                        label="Active Fee"
                        type="text"
                        value={settings?.acAmm}
                        variant="outlined"
                        onChange={(e) => set("acAmm", e.target.value)}
                    />
                    <InputFeild
                        label="How-to Video Link"
                        type="text"
                        value={settings?.ht_video}
                        variant="outlined"
                        onChange={(e) => set("ht_video", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4 pt-1">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 ring-1 ring-gray-100">
                            <label htmlFor="reg" className="text-sm text-gray-700">Register</label>
                            <Switch id="reg" color="green" checked={settings?.register}
                                onChange={(e) => set("register", e.target.checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 ring-1 ring-gray-100">
                            <label htmlFor="wd" className="text-sm text-gray-700">Withdraw</label>
                            <Switch id="wd" color="green" checked={settings?.withdraw}
                                onChange={(e) => set("withdraw", e.target.checked)}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* ── Refer Commission ──────────────────────────── */}
                <SectionCard icon={UserGroupIcon} title="Refer Commission" subtitle="Commission % for each referral generation">
                    <div className="grid grid-cols-2 gap-4">
                        {[["gen1", "Generation 1"], ["gen2", "Generation 2"], ["gen3", "Generation 3"], ["gen4", "Generation 4"], ["gen5", "Generation 5"], ["gen6", "Generation 6"]].map(([key, label]) => (
                            <InputFeild
                                key={key}
                                label={label}
                                type="number"
                                value={gen(key.replace("gen", ""))}
                                onChange={(e) => setNested("ref_comm", key, Number(e.target.value))}
                                variant="outlined"
                            />
                        ))}
                    </div>
                </SectionCard>

                {/* ── Community Links ───────────────────────────── */}
                <SectionCard icon={LinkIcon} title="Community Links" subtitle="Social channels and resources for users">
                    <div className="space-y-4">
                        <InputFeild label="Facebook Page" type="text" value={settings?.links?.page}
                            onChange={(e) => setNested("links", "page", e.target.value)} variant="outlined" />
                        <InputFeild label="Telegram" type="text" value={settings?.links?.telegram}
                            onChange={(e) => setNested("links", "telegram", e.target.value)} variant="outlined" />
                        <InputFeild label="Facebook Group" type="text" value={settings?.links?.facebook}
                            onChange={(e) => setNested("links", "facebook", e.target.value)} variant="outlined" />
                        <InputFeild label="Whatsapp Group" type="text" value={settings?.links?.whatsapp}
                            onChange={(e) => setNested("links", "whatsapp", e.target.value)} variant="outlined" />
                        <InputFeild label="Video Link" type="text" value={settings?.links?.video}
                            onChange={(e) => setNested("links", "video", e.target.value)} variant="outlined" />
                    </div>
                </SectionCard>
            </div>

            <div className="mt-6 flex justify-end">
                <Button
                    size="sm"
                    onClick={updateProfile}
                    disabled={loading}
                    className={`normal-case text-xs font-bold px-6 py-2.5 flex items-center gap-1.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow}`}
                >
                    {loading ? "Saving…" : "Save All Changes"}
                </Button>
            </div>
        </div>
    );
};

export default Settings;