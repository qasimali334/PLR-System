import 'dotenv/config';
import supabase from '../src/services/supabase.service.js';

try {
  const { data: paths, error } = await supabase
    .from('learning_paths')
    .select('*, learning_steps(*)');
  
  if (error) {
    console.error("Database query error:", error);
  } else {
    console.log("Found paths in DB:", paths.length);
    console.log("Path details:");
    paths.forEach(p => {
      console.log(`- Path ID: ${p.id}`);
      console.log(`  Title: ${p.title}`);
      console.log(`  Steps count: ${p.learning_steps?.length || 0}`);
      if (p.learning_steps?.length > 0) {
        console.log(`  Steps orders:`, p.learning_steps.map(s => s.step_order));
      }
    });
  }
} catch (err) {
  console.error("Exception caught:", err);
}
