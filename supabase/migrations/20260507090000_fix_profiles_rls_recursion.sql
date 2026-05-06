-- Fix: "infinite recursion detected in policy for relation profiles"
-- Cause: SELECT policy referenced profiles inside a subquery on profiles.
-- Run this in Supabase SQL Editor AFTER the initial schema migration (idempotent-ish).

--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.requester_household_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.household_id
  FROM public.profiles p
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.requester_household_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.requester_household_id() TO authenticated;

COMMENT ON FUNCTION public.requester_household_id IS
  'RLS helper: caller household without recursive profiles policy (SECURITY DEFINER bypasses RLS on inner read).';

--------------------------------------------------------------------------------
DROP POLICY IF EXISTS profiles_select_household ON public.profiles;

CREATE POLICY profiles_select_household ON public.profiles FOR SELECT TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
  );

--------------------------------------------------------------------------------
DROP POLICY IF EXISTS households_select_own ON public.households;

CREATE POLICY households_select_own ON public.households FOR SELECT TO authenticated
  USING (id IS NOT DISTINCT FROM public.requester_household_id());

--------------------------------------------------------------------------------
DROP POLICY IF EXISTS households_update_own_admin ON public.households;

CREATE POLICY households_update_own_admin ON public.households FOR UPDATE TO authenticated
  USING (
    id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  )
  WITH CHECK (
    id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'admin'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

--------------------------------------------------------------------------------
DROP POLICY IF EXISTS checklist_lists_select ON public.checklist_lists;

CREATE POLICY checklist_lists_select ON public.checklist_lists FOR SELECT TO authenticated
  USING (household_id IS NOT DISTINCT FROM public.requester_household_id());

--------------------------------------------------------------------------------
DROP POLICY IF EXISTS checklist_lists_insert ON public.checklist_lists;

CREATE POLICY checklist_lists_insert ON public.checklist_lists FOR INSERT TO authenticated
  WITH CHECK (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

--------------------------------------------------------------------------------
DROP POLICY IF EXISTS checklist_lists_update ON public.checklist_lists;

CREATE POLICY checklist_lists_update ON public.checklist_lists FOR UPDATE TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  )
  WITH CHECK (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

--------------------------------------------------------------------------------
DROP POLICY IF EXISTS checklist_lists_delete ON public.checklist_lists;

CREATE POLICY checklist_lists_delete ON public.checklist_lists FOR DELETE TO authenticated
  USING (
    household_id IS NOT DISTINCT FROM public.requester_household_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
        AND p.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

--------------------------------------------------------------------------------
DROP POLICY IF EXISTS checklist_items_select ON public.checklist_items;
DROP POLICY IF EXISTS checklist_items_insert ON public.checklist_items;
DROP POLICY IF EXISTS checklist_items_update ON public.checklist_items;
DROP POLICY IF EXISTS checklist_items_delete ON public.checklist_items;

CREATE POLICY checklist_items_select ON public.checklist_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY checklist_items_insert ON public.checklist_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
    )
    AND EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY checklist_items_update ON public.checklist_items FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
    )
    AND EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
    )
    AND EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );

CREATE POLICY checklist_items_delete ON public.checklist_items FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role <> 'viewer'
    )
    AND EXISTS (
      SELECT 1 FROM public.checklist_lists cl
      WHERE cl.id = checklist_items.checklist_list_id
        AND cl.household_id IS NOT DISTINCT FROM public.requester_household_id()
    )
  );
