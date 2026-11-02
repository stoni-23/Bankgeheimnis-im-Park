import { createClient } from '@supabase/supabase-js';

const url = 'https://espbxuhqaveurnzviglt.supabase.co';
const key = 'sb_publishable_35bLvwrzE1y0prcVXB3KCg_UK9FcLUb';

export const supabase = createClient(url, key);
