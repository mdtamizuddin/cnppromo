import React, { useEffect, useState } from 'react';
import { Button, Input } from '@material-tailwind/react';
import { useQuery, useQueryClient } from 'react-query';
import {
  CreditCardIcon,
  PhoneIcon,
  AtSymbolIcon,
  BanknotesIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../../../util/axios';
import Loader from '../../../Components/Loader';
import {
  PageHeader, TableCard, StatGrid, StatCard, ACCENTS,
} from '../../../Components/AdminLayout/_Ui/AdminUI';

const ACCENT = ACCENTS.teal;

const METHODS = [
  { key: 'bkash', label: 'bKash', placeholder: '01XXXXXXXXX', color: 'text-pink-500', bg: 'bg-pink-50', ring: 'ring-pink-100', badge: 'bg-pink-500', initials: 'BK' },
  { key: 'nagad', label: 'Nagad', placeholder: '01XXXXXXXXX', color: 'text-orange-500', bg: 'bg-orange-50', ring: 'ring-orange-100', badge: 'bg-orange-500', initials: 'NG' },
  { key: 'rocket', label: 'Rocket', placeholder: 'XXXXXXXXXXX', color: 'text-purple-500', bg: 'bg-purple-50', ring: 'ring-purple-100', badge: 'bg-purple-500', initials: 'RK' },
  { key: 'upay', label: 'UPay', placeholder: '01XXXXXXXXX', color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-100', badge: 'bg-emerald-500', initials: 'UP' },
  { key: 'payeer', label: 'Payeer', placeholder: 'Wallet ID', color: 'text-blue-500', bg: 'bg-blue-50', ring: 'ring-blue-100', badge: 'bg-blue-500', initials: 'PY' },
];

const MethedCard = ({ meta, value, onEdit }) => {
  const configured = Boolean(value);
  return (
    <div className={`relative rounded-2xl border bg-white p-5 transition-all duration-300 group ${configured ? 'border-gray-200 hover:shadow-md hover:border-gray-300' : 'border-dashed border-gray-200 hover:border-gray-300'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`shrink-0 grid place-items-center w-11 h-11 rounded-xl ${meta.bg} ${meta.color}`}>
            <span className="text-xs font-black tracking-wider">{meta.initials}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-gray-900">{meta.label}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide ${configured ? 'text-emerald-600' : 'text-gray-400'}`}>
                <CheckCircleIcon className={`w-3.5 h-3.5 ${configured ? 'text-emerald-500' : 'text-gray-300'}`} />
                {configured ? 'Configured' : 'Not set'}
              </span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="text"
          className="shrink-0 normal-case text-xs p-0 h-8 w-8 grid place-items-center text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg"
          onClick={() => onEdit(meta)}
          title={configured ? 'Edit' : 'Set account'}
        >
          <PencilSquareIcon className="w-4 h-4" strokeWidth={1.9} />
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gray-50 ring-1 ring-gray-100">
        <span className="text-base font-bold text-gray-400">{meta.initials}</span>
        <span className="text-sm font-semibold text-gray-800 truncate">{value || '—'}</span>
      </div>
    </div>
  );
};

const PaymentGateway = () => {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(null);
  const [editKey, setEditKey] = useState(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: settings, isLoading } = useQuery(
    ['admin-setting'],
    async () => {
      const res = await api.get('/setting');
      return res.data?.setting || {};
    },
    { staleTime: 30000 }
  );

  useEffect(() => {
    if (settings?.accounts) {
      setPhone(settings.accounts.phone || '');
      setEmail(settings.accounts.email || '');
    }
  }, [settings]);

  if (isLoading) return <Loader />;

  const accounts = settings?.accounts || {};
  const configuredCount = METHODS.filter((m) => accounts[m.key]).length + (accounts.phone || accounts.email ? 1 : 0);

  const patchAccounts = async (patch) => {
    setSaving(true);
    try {
      await api.put('/setting', { ...settings, accounts: { ...accounts, ...patch } });
      await queryClient.invalidateQueries(['admin-setting']);
      toast.success('Payment account saved');
      setEditKey(null);
      setDraft(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const saveContact = async () => {
    setSaving(true);
    try {
      await api.put('/setting', { ...settings, accounts: { ...accounts, phone, email } });
      await queryClient.invalidateQueries(['admin-setting']);
      toast.success('Contact info saved');
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full pb-10">
      <PageHeader
        icon={CreditCardIcon}
        accent="teal"
        title="Payment Gateway"
        subtitle="Manage the payout accounts and methods users are funded through."
        action={
          <Button
            size="sm"
            className={`normal-case text-xs font-bold px-4 py-2.5 flex items-center gap-1.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow}`}
            onClick={() => queryClient.invalidateQueries(['admin-setting'])}
            disabled={saving}
          >
            <ArrowPathIcon className="w-4 h-4" strokeWidth={2.2} />
            Refresh
          </Button>
        }
      />

      <StatGrid>
        <StatCard
          title="Configured Methods"
          value={configuredCount}
          hint={`of ${METHODS.length + 1}`}
          icon={CreditCardIcon}
          colorClass="text-teal-500"
          bgClass="bg-teal-50"
        />
        <StatCard
          title="Contact Saved"
          value={accounts.phone || accounts.email ? 'Yes' : 'No'}
          hint="phone + email"
          icon={PhoneIcon}
          colorClass="text-blue-500"
          bgClass="bg-blue-50"
        />
        <StatCard
          title="Mobile Methods"
          value={['bkash', 'nagad', 'rocket', 'upay'].filter((k) => accounts[k]).length}
          hint="of 4 supported"
          icon={BanknotesIcon}
          colorClass="text-purple-500"
          bgClass="bg-purple-50"
        />
        <StatCard
          title="Wallet Methods"
          value={['payeer'].filter((k) => accounts[k]).length}
          hint="international"
          icon={AtSymbolIcon}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50"
        />
      </StatGrid>

      {/* ── Contact Info ─────────────────────────────────────── */}
      <SectionCard>
        <div className="flex items-center gap-3 mb-5">
          <div className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-blue-50">
            <AtSymbolIcon className="w-5 h-5 text-blue-600" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900">Contact Information</h2>
            <p className="text-xs text-gray-500 mt-0.5">Primary phone and email used for support and payout tracking.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            variant="outlined"
            size="lg"
            className="!border !border-gray-200 bg-gray-50 focus:bg-white text-gray-900 shadow-none ring-0 focus:!border-teal-500 transition-colors"
            labelProps={{ className: 'text-gray-500' }}
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            size="lg"
            className="!border !border-gray-200 bg-gray-50 focus:bg-white text-gray-900 shadow-none ring-0 focus:!border-teal-500 transition-colors"
            labelProps={{ className: 'text-gray-500' }}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            size="sm"
            onClick={saveContact}
            disabled={saving}
            className={`normal-case text-xs font-bold px-5 py-2.5 rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow}`}
          >
            {saving ? 'Saving…' : 'Save Contact'}
          </Button>
        </div>
      </SectionCard>

      {/* ── Payment Methods ──────────────────────────────────── */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="shrink-0 grid place-items-center w-10 h-10 rounded-xl bg-teal-50">
            <CreditCardIcon className="w-5 h-5 text-teal-600" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-gray-900">Payment Methods</h2>
            <p className="text-xs text-gray-500 mt-0.5">Tap the pencil on any method to set its receiving account number.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {METHODS.map((meta) => (
            <MethedCard
              key={meta.key}
              meta={meta}
              value={accounts[meta.key]}
              onEdit={(m) => { setDraft({ ...m, current: accounts[m.key] }); setEditKey(m.key); }}
            />
          ))}
        </div>
      </div>

      {/* ── Edit Modal ───────────────────────────────────────── */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => { setEditKey(null); setDraft(null); }} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`shrink-0 grid place-items-center w-11 h-11 rounded-xl ${draft.bg} ${draft.color}`}>
                <span className="text-xs font-black tracking-wider">{draft.initials}</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Edit {draft.label}</h3>
                <p className="text-xs text-gray-500">Set the receiving account number</p>
              </div>
            </div>

            <Input
              label={`${draft.label} Account`}
              placeholder={draft.placeholder}
              defaultValue={draft.current || ''}
              onChange={(e) => setDraft({ ...draft, current: e.target.value })}
              variant="outlined"
              size="lg"
              className="!border !border-gray-200 bg-gray-50 focus:bg-white text-gray-900 shadow-none ring-0 focus:!border-teal-500 transition-colors"
              labelProps={{ className: 'text-gray-500' }}
            />

            <div className="mt-6 flex gap-2 justify-end">
              <Button
                size="sm"
                variant="text"
                color="gray"
                className="normal-case rounded-xl"
                onClick={() => { setEditKey(null); setDraft(null); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => patchAccounts({ [editKey]: draft.current })}
                disabled={saving}
                className={`normal-case rounded-xl shadow-md ${ACCENT.solid} ${ACCENT.shadow}`}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SectionCard = ({ children }) => (
  <TableCard>
    <div className="p-5 sm:p-6">{children}</div>
  </TableCard>
);

export default PaymentGateway;
