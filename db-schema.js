const { Pool } = require('pg');
const DB_URL = process.argv[2];
const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
(async () => {
  const tables = ['award_sweet_spots', 'trip_searches', 'trip_plans', 'users'];
  for (const t of tables) {
    try {
      const r = await pool.query(`
        SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name='${t}'
        ORDER BY ordinal_position
      `);
      const fk = await pool.query(`
        SELECT kcu.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_col
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name=kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name=ccu.constraint_name
        WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_name='${t}'
      `);
      console.log(`=== \\d ${t} ===`);
      r.rows.forEach(c => console.log(`  ${c.column_name.padEnd(28)} ${c.data_type.padEnd(25)} ${c.is_nullable==='YES'?'NULL    ':'NOT NULL'} ${(c.column_default||'').slice(0,30)}`));
      if (fk.rows.length) { console.log('  FK:'); fk.rows.forEach(f => console.log(`    ${f.column_name} -> ${f.ref_table}(${f.ref_col})`)); }
    } catch(e) { console.log(`  TABLE MISSING or ERROR: ${e.message}`); }
    console.log('');
  }
  await pool.end();
})();
