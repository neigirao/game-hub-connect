-- Gacha pull RPC: deducts coins, returns random item based on rarity weights.
-- If item is already owned, refunds coins based on tier.
CREATE OR REPLACE FUNCTION gacha_pull(p_user_id UUID, p_crate_cost INT DEFAULT 150)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_coins     INT;
  v_inventory JSONB;
  v_item_id   TEXT;
  v_tier      TEXT;
  v_refund    INT := 0;
  v_roll      FLOAT := random();
BEGIN
  SELECT coins, COALESCE(inventory, '[]'::jsonb)
    INTO v_coins, v_inventory
    FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;

  IF v_coins < p_crate_cost THEN
    RAISE EXCEPTION 'insufficient_coins';
  END IF;

  -- Deduct crate cost upfront
  UPDATE profiles SET coins = coins - p_crate_cost WHERE id = p_user_id;

  -- Roll rarity and pick item from that tier
  IF v_roll < 0.60 THEN
    v_tier    := 'common';
    v_item_id := (ARRAY['badge_parque', 'badge_vulcao'])[1 + floor(random() * 2)::int];
  ELSIF v_roll < 0.85 THEN
    v_tier    := 'rare';
    v_item_id := (ARRAY['badge_praia', 'badge_espaco', 'cenario_praia'])[1 + floor(random() * 3)::int];
  ELSIF v_roll < 0.95 THEN
    v_tier    := 'epic';
    v_item_id := (ARRAY['skin_candy', 'cenario_noite', 'skin_ghost'])[1 + floor(random() * 3)::int];
  ELSE
    v_tier    := 'legendary';
    v_item_id := (ARRAY['skin_rocket', 'skin_gold', 'skin_inferno'])[1 + floor(random() * 3)::int];
  END IF;

  -- Duplicate check: refund coins of equivalent value
  IF v_inventory @> to_jsonb(ARRAY[v_item_id]) THEN
    v_refund := CASE v_tier
      WHEN 'common'    THEN 30
      WHEN 'rare'      THEN 75
      WHEN 'epic'      THEN 150
      WHEN 'legendary' THEN 300
    END;
    UPDATE profiles SET coins = coins + v_refund WHERE id = p_user_id;
    RETURN json_build_object(
      'item_id',      v_item_id,
      'tier',         v_tier,
      'duplicate',    true,
      'coins_refund', v_refund,
      'new_coins',    (SELECT coins FROM profiles WHERE id = p_user_id)
    );
  END IF;

  -- Add item to inventory
  UPDATE profiles
    SET inventory = v_inventory || to_jsonb(v_item_id)
    WHERE id = p_user_id;

  RETURN json_build_object(
    'item_id',      v_item_id,
    'tier',         v_tier,
    'duplicate',    false,
    'coins_refund', 0,
    'new_coins',    (SELECT coins FROM profiles WHERE id = p_user_id)
  );
END;
$$;
