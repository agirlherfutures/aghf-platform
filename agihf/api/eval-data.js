// api/eval-data.js — every Eval Calculator CRUD endpoint (trading accounts
// + eval plans), consolidated into one Vercel serverless function,
// dispatched on ?resource=, purely to stay under the Vercel Hobby plan's
// 12-serverless-function-per-deployment limit — agihf/api/ was already at
// 10 files before this feature, leaving only 2 slots. Mirrors
// agihf/api/agent-data.js's exact shape (one shared Supabase client, one
// notSetUpError helper, dispatch on req.query.resource, same JWT-verify-
// then-scope-every-query-to-user.id pattern every endpoint in this project
// uses).

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

function notSetUpError(res, err) {
  const notSetUp = /relation .* does not exist/i.test(err.message || '');
  return res.status(notSetUp ? 503 : 500).json({
    error: notSetUp
      ? 'The Eval Calculator database tables haven’t been set up yet — see supabase/migrations/0006_eval_calculator_and_accounts.sql.'
      : err.message,
    setupRequired: notSetUp,
  });
}

/* ── trading accounts ─────────────────────────────────────────────── */

function accountShape(row) {
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, name: row.name, propFirm: row.prop_firm,
    accountSize: row.account_size, startingBalance: row.starting_balance,
    isDefault: row.is_default, archivedAt: row.archived_at,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

async function handleTradingAccounts(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (id) {
        const { data, error } = await supabase.from('trading_accounts').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
        if (error) throw error;
        return res.status(200).json({ account: accountShape(data) });
      }
      const { data, error } = await supabase.from('trading_accounts').select('*')
        .eq('user_id', userId).is('archived_at', null).order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json({ accounts: (data || []).map(accountShape) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const row = {
        user_id: userId, name: body.name || 'Trading Account', prop_firm: body.propFirm || null,
        account_size: body.accountSize ?? null, starting_balance: body.startingBalance ?? null,
        is_default: !!body.isDefault,
      };
      if (row.is_default) await supabase.from('trading_accounts').update({ is_default: false }).eq('user_id', userId);
      const { data, error } = await supabase.from('trading_accounts').insert(row).select('*').single();
      if (error) throw error;
      return res.status(200).json({ account: accountShape(data) });
    }

    if (req.method === 'PATCH') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const body = req.body || {};
      const patch = { updated_at: new Date().toISOString() };
      if (body.name !== undefined) patch.name = body.name;
      if (body.propFirm !== undefined) patch.prop_firm = body.propFirm;
      if (body.accountSize !== undefined) patch.account_size = body.accountSize;
      if (body.startingBalance !== undefined) patch.starting_balance = body.startingBalance;
      if (body.archived !== undefined) patch.archived_at = body.archived ? new Date().toISOString() : null;
      if (body.isDefault === true) {
        await supabase.from('trading_accounts').update({ is_default: false }).eq('user_id', userId);
        patch.is_default = true;
      } else if (body.isDefault === false) {
        patch.is_default = false;
      }
      const { data, error } = await supabase.from('trading_accounts').update(patch).eq('id', id).eq('user_id', userId).select('*').single();
      if (error) throw error;
      return res.status(200).json({ account: accountShape(data) });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('trading_accounts').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Trading accounts API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── eval plans ───────────────────────────────────────────────────── */

function planShape(row) {
  if (!row) return null;
  return {
    id: row.id, userId: row.user_id, tradingAccountId: row.trading_account_id,
    name: row.name, status: row.status, isActive: row.is_active,
    accountSize: row.account_size, isCustomAccount: row.is_custom_account, startingBalance: row.starting_balance,
    profitTargetType: row.profit_target_type, profitTargetValue: row.profit_target_value,
    drawdownType: row.drawdown_type, drawdownValue: row.drawdown_value,
    dailyLossLimit: row.daily_loss_limit, minTradingDays: row.min_trading_days, maxTradingDays: row.max_trading_days,
    consistencyRulePct: row.consistency_rule_pct,
    instrument: row.instrument, manualPointValue: row.manual_point_value, contractsPlanned: row.contracts_planned,
    riskMode: row.risk_mode, riskPerTradeValue: row.risk_per_trade_value, rewardPerTradeValue: row.reward_per_trade_value,
    plannedRiskRewardRatio: row.planned_risk_reward_ratio, assumedWinRatePct: row.assumed_win_rate_pct,
    feesPerTrade: row.fees_per_trade, maxTradesPerDay: row.max_trades_per_day, maxLossesPerDay: row.max_losses_per_day,
    stopAfterWin: row.stop_after_win, reduceSizeAfterLoss: row.reduce_size_after_loss,
    reduceSizeAfterLossPct: row.reduce_size_after_loss_pct, secondTradeContractSize: row.second_trade_contract_size,
    tradingDaysPerWeek: row.trading_days_per_week,
    currentBalance: row.current_balance, tradingDaysElapsed: row.trading_days_elapsed,
    notes: row.notes, archivedAt: row.archived_at, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

const PLAN_FIELD_MAP = {
  name: 'name', status: 'status', isActive: 'is_active', tradingAccountId: 'trading_account_id',
  accountSize: 'account_size', isCustomAccount: 'is_custom_account', startingBalance: 'starting_balance',
  profitTargetType: 'profit_target_type', profitTargetValue: 'profit_target_value',
  drawdownType: 'drawdown_type', drawdownValue: 'drawdown_value',
  dailyLossLimit: 'daily_loss_limit', minTradingDays: 'min_trading_days', maxTradingDays: 'max_trading_days',
  consistencyRulePct: 'consistency_rule_pct',
  instrument: 'instrument', manualPointValue: 'manual_point_value', contractsPlanned: 'contracts_planned',
  riskMode: 'risk_mode', riskPerTradeValue: 'risk_per_trade_value', rewardPerTradeValue: 'reward_per_trade_value',
  plannedRiskRewardRatio: 'planned_risk_reward_ratio', assumedWinRatePct: 'assumed_win_rate_pct',
  feesPerTrade: 'fees_per_trade', maxTradesPerDay: 'max_trades_per_day', maxLossesPerDay: 'max_losses_per_day',
  stopAfterWin: 'stop_after_win', reduceSizeAfterLoss: 'reduce_size_after_loss',
  reduceSizeAfterLossPct: 'reduce_size_after_loss_pct', secondTradeContractSize: 'second_trade_contract_size',
  tradingDaysPerWeek: 'trading_days_per_week', notes: 'notes',
};

// current_balance/trading_days_elapsed deliberately excluded from the
// generic field map — those only ever change via the dedicated "sync"
// path below, never a generic PATCH, so planned assumptions can never be
// silently overwritten by an unrelated edit.
function bodyToPlanRow(body, userId) {
  const row = { user_id: userId };
  for (const [clientKey, column] of Object.entries(PLAN_FIELD_MAP)) {
    if (body[clientKey] !== undefined) row[column] = body[clientKey];
  }
  return row;
}

async function handleEvalPlans(req, res, userId) {
  try {
    if (req.method === 'GET') {
      const { id, tradingAccountId, status } = req.query;
      if (id) {
        const { data, error } = await supabase.from('eval_plans').select('*').eq('user_id', userId).eq('id', id).maybeSingle();
        if (error) throw error;
        return res.status(200).json({ plan: planShape(data) });
      }
      let query = supabase.from('eval_plans').select('*').eq('user_id', userId).is('archived_at', null);
      if (tradingAccountId) query = query.eq('trading_account_id', tradingAccountId);
      if (status) query = query.eq('status', status);
      const { data, error } = await query.order('updated_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ plans: (data || []).map(planShape) });
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      if (body.duplicateFromId) {
        const { data: source, error: fetchErr } = await supabase.from('eval_plans').select('*').eq('id', body.duplicateFromId).eq('user_id', userId).maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!source) return res.status(404).json({ error: 'Plan to duplicate not found' });
        const clone = { ...source };
        delete clone.id; delete clone.created_at; delete clone.updated_at;
        clone.name = `${source.name} (Copy)`;
        clone.status = 'draft';
        clone.is_active = false;
        clone.current_balance = null;
        clone.trading_days_elapsed = 0;
        const { data, error } = await supabase.from('eval_plans').insert(clone).select('*').single();
        if (error) throw error;
        return res.status(200).json({ plan: planShape(data) });
      }

      const row = bodyToPlanRow(body, userId);
      if (!row.name) row.name = 'New Eval Plan';
      if (row.account_size == null) row.account_size = body.accountSize ?? 50000;
      if (row.starting_balance == null) row.starting_balance = body.startingBalance ?? row.account_size;
      if (row.is_active) await supabase.from('eval_plans').update({ is_active: false }).eq('user_id', userId);
      const { data, error } = await supabase.from('eval_plans').insert(row).select('*').single();
      if (error) throw error;
      return res.status(200).json({ plan: planShape(data) });
    }

    if (req.method === 'PATCH') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const body = req.body || {};

      if (body.archived !== undefined) {
        const { data, error } = await supabase.from('eval_plans')
          .update({ archived_at: body.archived ? new Date().toISOString() : null, updated_at: new Date().toISOString() })
          .eq('id', id).eq('user_id', userId).select('*').single();
        if (error) throw error;
        return res.status(200).json({ plan: planShape(data) });
      }

      if (body.setActive === true) {
        await supabase.from('eval_plans').update({ is_active: false }).eq('user_id', userId);
        const { data, error } = await supabase.from('eval_plans')
          .update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId).select('*').single();
        if (error) throw error;
        return res.status(200).json({ plan: planShape(data) });
      }

      // Explicit member "sync" action — the ONLY path that ever writes
      // current_balance/trading_days_elapsed, so a plan's actual progress
      // is never a silent side effect of an unrelated edit.
      if (body.sync) {
        const patch = { updated_at: new Date().toISOString() };
        if (body.currentBalance !== undefined) patch.current_balance = body.currentBalance;
        if (body.tradingDaysElapsed !== undefined) patch.trading_days_elapsed = body.tradingDaysElapsed;
        const { data, error } = await supabase.from('eval_plans').update(patch).eq('id', id).eq('user_id', userId).select('*').single();
        if (error) throw error;
        return res.status(200).json({ plan: planShape(data) });
      }

      const patch = { ...bodyToPlanRow(body, userId), updated_at: new Date().toISOString() };
      delete patch.user_id;
      const { data, error } = await supabase.from('eval_plans').update(patch).eq('id', id).eq('user_id', userId).select('*').single();
      if (error) throw error;
      return res.status(200).json({ plan: planShape(data) });
    }

    if (req.method === 'DELETE') {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: 'Missing id' });
      const { error } = await supabase.from('eval_plans').delete().eq('id', id).eq('user_id', userId);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Eval plans API error:', err);
    return notSetUpError(res, err);
  }
}

/* ── dispatch ─────────────────────────────────────────────────────── */

const RESOURCE_HANDLERS = {
  'trading-accounts': handleTradingAccounts,
  'eval-plans': handleEvalPlans,
};

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid or expired token' });

  const resourceHandler = RESOURCE_HANDLERS[req.query.resource];
  if (!resourceHandler) return res.status(400).json({ error: `Unknown resource: ${req.query.resource}` });
  return resourceHandler(req, res, user.id);
}
