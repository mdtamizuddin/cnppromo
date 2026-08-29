import React, { useState } from "react";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "antd";
import Cookie from "js-cookie";
import toast from "react-hot-toast";
import moment from "moment";
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { api } from "../../util/axios";

/* ── Bits ─────────────────────────────────────────────────────────────── */

const Skeleton = ({ className = "" }) => (
  <div className={`bg-gray-200/70 animate-pulse rounded-lg ${className}`} />
);

const deviceIcon = (kind) =>
  kind === "mobile" ? DevicePhoneMobileIcon : kind === "tablet" ? DeviceTabletIcon : ComputerDesktopIcon;

const StatusChip = ({ status, isCurrent }) => {
  const map = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    logged_out: "bg-gray-100 text-gray-500 ring-gray-200",
    expired: "bg-amber-50 text-amber-700 ring-amber-100",
  };
  const label = { active: "Active", logged_out: "Logged out", expired: "Expired" }[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 ${map[status]}`}
      >
        {status === "active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        {label}
      </span>
      {isCurrent && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold ring-1 bg-brand-soft text-brand ring-brand/20">
          This device
        </span>
      )}
    </span>
  );
};

const DeviceIdentity = ({ session }) => {
  const Icon = deviceIcon(session.device?.kind);
  return (
    <div className="flex items-center gap-3 min-w-0">
      <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 shrink-0">
        <Icon className="w-5 h-5 text-gray-500" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-800 truncate">
          {session.device?.name}
        </span>
        <span className="block text-xs text-gray-400 truncate">
          {session.device?.os} / {session.device?.browser}
        </span>
      </span>
    </div>
  );
};

/* ── One row, table on desktop and a card below sm ────────────────────── */

const SessionRow = ({ session, onLogout, busy, showAction }) => (
  <div
    className="grid gap-3 px-4 sm:px-5 py-4 items-center
      grid-cols-1
      sm:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto]"
  >
    <DeviceIdentity session={session} />

    <div className="text-xs text-gray-500 min-w-0">
      <span className="sm:hidden font-semibold text-gray-400">IP: </span>
      <span className="font-mono tabular-nums break-all">{session.ip}</span>
    </div>

    <div className="text-xs text-gray-500">
      {session.status === "active" ? (
        moment(session.lastActiveAt).fromNow()
      ) : (
        <>
          {`Ended ${moment(session.revokedAt || session.lastActiveAt).fromNow()}`}
          {session.revokedBy === "limit" && (
            <span className="block text-[10px] text-gray-400">
              Device limit reached
            </span>
          )}
        </>
      )}
    </div>

    <div className="flex items-center justify-between sm:justify-end gap-3">
      <StatusChip status={session.status} isCurrent={session.isCurrent} />
      {showAction && (
        <button
          type="button"
          onClick={() => onLogout(session)}
          disabled={busy}
          className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 text-xs font-bold
            hover:bg-rose-50 disabled:opacity-50 transition-colors shrink-0
            focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        >
          Logout
        </button>
      )}
    </div>
  </div>
);

const SectionCard = ({ title, count, children, headers }) => (
  <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-4 sm:px-5 pt-5 pb-3">
      <h2 className="text-base font-black text-gray-900">{title}</h2>
      <span className="min-w-[22px] h-[22px] px-1.5 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold tabular-nums">
        {count}
      </span>
    </div>
    {headers && (
      <div
        className="hidden sm:grid gap-3 px-5 pb-2 border-b border-gray-100
          grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto]
          text-[10px] font-bold uppercase tracking-widest text-gray-400"
      >
        {headers.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
    )}
    <div className="divide-y divide-gray-100">{children}</div>
  </section>
);

/* ── Page ─────────────────────────────────────────────────────────────── */

const LoginDevices = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["login-sessions"],
    queryFn: async () => {
      const res = await api.get("/session");
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

  // Signing yourself out is a different action from signing out a stray device,
  // so it confirms first and then actually ends the local session.
  const doLogout = async (session) => {
    setPending(session._id);
    try {
      const res = await api.delete(`/session/${session._id}`);
      if (res.data?.wasCurrent) {
        Cookie.remove("token-you");
        toast.success("Signed out on this device");
        window.location.href = "/login";
        return;
      }
      toast.success(res.data?.message || "Device logged out");
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not log out that device");
    } finally {
      setPending(null);
      setConfirm(null);
    }
  };

  const logoutOthers = async () => {
    setPending("others");
    try {
      const res = await api.post("/session/revoke-others");
      toast.success(res.data?.message || "Other devices signed out");
      refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setPending(null);
    }
  };

  // Ends this device's session too, so it always finishes at the login screen.
  const logoutEverywhere = async () => {
    setPending("all");
    try {
      await api.post("/session/revoke-all");
      Cookie.remove("token-you");
      toast.success("Signed out on every device");
      window.location.href = "/login";
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      setPending(null);
    }
  };

  const active = data?.active || [];
  const ended = data?.ended || [];
  const summary = data?.summary;
  const otherActive = active.filter((s) => !s.isCurrent).length;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-0 py-6 space-y-5">
      <Modal
        open={!!confirm}
        onCancel={() => setConfirm(null)}
        onOk={() => (confirm === "all" ? logoutEverywhere() : doLogout(confirm))}
        okText="Sign out"
        okButtonProps={{
          danger: true,
          loading: pending === "all" || pending === confirm?._id,
        }}
        title={confirm === "all" ? "Sign out everywhere?" : "Sign out of this device?"}
      >
        <p className="text-sm text-gray-600">
          {confirm === "all"
            ? "Every device, including this one, will be signed out. You will need to log in again."
            : "You are using this device right now. Signing out will return you to the login screen."}
        </p>
      </Modal>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">My Login Devices</h1>
        <nav className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
          <Link to="/" className="text-brand font-semibold hover:underline">
            Home
          </Link>
          <ChevronRightIcon className="w-3 h-3" />
          <span>Login Devices</span>
        </nav>
      </div>

      {/* Summary */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-[1fr_auto_260px] items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-soft shrink-0">
              <ShieldCheckIcon className="w-7 h-7 text-brand" />
            </span>
            <div>
              <p className="text-sm text-gray-600">This account is signed in on</p>
              {isLoading ? (
                <Skeleton className="h-8 w-32 my-1" />
              ) : (
                <p className="text-2xl font-black text-brand">
                  {summary?.activeCount || 0} of {summary?.maxDevices ?? 3}{" "}
                  {summary?.maxDevices === 1 ? "device" : "devices"}
                </p>
              )}
              <p className="text-xs text-gray-500 max-w-[44ch]">
                You can stay signed in on up to {summary?.maxDevices ?? 3} devices. Logging
                in on a new one signs out the device you logged into longest ago.
              </p>
            </div>
          </div>

          <span className="hidden sm:block w-px self-stretch bg-gray-100" />

          <dl className="space-y-2.5">
            {[
              {
                k: "Active devices",
                v: `${summary?.activeCount ?? 0} / ${summary?.maxDevices ?? 3}`,
                dot: "bg-emerald-500",
              },
              { k: "Signed-out devices", v: summary?.endedCount ?? 0, dot: "bg-gray-300" },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between gap-3">
                <dt className="flex items-center gap-2 text-sm text-gray-600">
                  <span className={`w-2.5 h-2.5 rounded-full ${row.dot}`} />
                  {row.k}
                </dt>
                <dd className="text-sm font-black text-gray-900 tabular-nums">{row.v}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3">
              <dt className="text-sm text-gray-600">Last login</dt>
              <dd className="text-sm font-semibold text-gray-700">
                {summary?.lastLoginAt ? moment(summary.lastLoginAt).fromNow() : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Active */}
      <SectionCard
        title="Active Devices"
        count={isLoading ? "—" : active.length}
        headers={["Device / Browser", "IP address", "Last active", "Status"]}
      >
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-gray-200/70 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-2.5 w-28" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))
        ) : active.length ? (
          active.map((s) => (
            <SessionRow
              key={s._id}
              session={s}
              busy={pending === s._id}
              showAction
              onLogout={(sess) => (sess.isCurrent ? setConfirm(sess) : doLogout(sess))}
            />
          ))
        ) : (
          <p className="px-5 py-8 text-sm text-center text-gray-400">
            No active sessions on record.
          </p>
        )}
      </SectionCard>

      {/* Ended */}
      {!isLoading && ended.length > 0 && (
        <SectionCard
          title="Signed-out Devices"
          count={ended.length}
          headers={["Device / Browser", "IP address", "Ended", "Status"]}
        >
          {ended.map((s) => (
            <SessionRow key={s._id} session={s} showAction={false} />
          ))}
        </SectionCard>
      )}

      {/* Bulk sign-out */}
      {!isLoading && active.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={logoutOthers}
            disabled={otherActive === 0 || !!pending}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
              bg-white border border-gray-200 text-gray-700 text-sm font-bold shadow-sm
              hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Sign out other devices{otherActive > 0 ? ` (${otherActive})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setConfirm("all")}
            disabled={!!pending}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl
              bg-white border border-rose-200 text-rose-600 text-sm font-bold shadow-sm
              hover:bg-rose-50 disabled:opacity-40 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Sign out everywhere
          </button>
        </div>
      )}

      {/* Security tips */}
      <section className="flex gap-4 p-5 rounded-2xl bg-amber-50 border border-amber-100">
        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-100 shrink-0">
          <LockClosedIcon className="w-5 h-5 text-amber-700" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-amber-900">Security tips</h3>
          <ul className="mt-1 space-y-0.5 text-xs text-amber-800 list-disc list-inside">
            <li>Always sign out from shared or public devices.</li>
            <li>Change your password regularly to keep your account secure.</li>
          </ul>
        </div>
      </section>

      {/* Change password */}
      <section className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl bg-brand-soft/60 border border-brand/10">
        <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white shrink-0">
          <QuestionMarkCircleIcon className="w-5 h-5 text-brand" />
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900">Don't recognise a device?</h3>
          <p className="text-xs text-gray-600">
            Sign it out above, then change your password straight away.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/user/settings")}
          className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-bold shadow-sm
            hover:bg-brand/90 transition-colors shrink-0
            focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
        >
          Change Password
        </button>
      </section>
    </div>
  );
};

export default LoginDevices;
