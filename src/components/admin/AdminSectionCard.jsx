import React from 'react';
    import { motion } from 'framer-motion';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Edit3, Trash2, PlusCircle } from 'lucide-react';

    const AdminSectionCard = ({ section, index, onEdit, onDelete, onAdd, currentUserEmail, adminEmail }) => {
      return (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="card-cheerful bg-slate-800/70 border-blue-700/50 shadow-blue-500/20 h-full flex flex-col">
            <CardHeader className="items-center text-center">
              <div className="p-3 bg-blue-600/20 rounded-full mb-3 text-blue-500">
                {section.icon}
              </div>
              <CardTitle className="text-xl text-blue-400">{section.title}</CardTitle>
              {section.description && <CardDescription className="text-blue-300/80 text-sm px-2">{section.description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex-grow px-4 text-sm">
              {section.customContent ? section.customContent : (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {section.data && section.data.length > 0 ? section.data.map((item) => (
                    <li key={item.id || item.email} className="flex justify-between items-center p-2 bg-slate-700/50 hover:bg-slate-700/80 rounded-md transition-colors duration-150">
                      <span className="text-slate-300 truncate mr-2 text-xs sm:text-sm">{section.renderItem(item)}</span>
                      {section.type !== 'user' || (item.email !== adminEmail && item.email !== currentUserEmail) ? (
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-400 hover:text-yellow-300" onClick={() => onEdit(item)} disabled={section.type === 'user' && !item.id}>
                            <Edit3 size={14} />
                          </Button>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-300" onClick={() => onDelete(item)} disabled={section.type === 'user' && !item.id}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  )) : <p className="text-slate-400 text-center py-4">Tidak ada data.</p>}
                </ul>
              )}
            </CardContent>
            <CardFooter className="justify-center pt-4 border-t border-slate-700/50 mt-auto">
              {!section.customContent && section.type !== 'stats_transactions' && section.type !== 'user' && (
                 <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto text-sm flex items-center" onClick={onAdd}>
                   <PlusCircle size={16} className="mr-2" /> Tambah Baru
                 </Button>
              )}
               {section.type === 'user' && (
                 <p className="text-xs text-slate-400 text-center">Manajemen pengguna detail via Supabase Studio.</p>
               )}
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default AdminSectionCard;