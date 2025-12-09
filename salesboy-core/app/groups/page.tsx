import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/toast';

interface Group {
  group_id: string;
  group_name: string;
  auto_reply: boolean;
  settings: any;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        setGroups(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast({ title: 'Failed to load groups', variant: 'destructive' });
        setLoading(false);
      });
  }, []);

  const toggleIgnore = async (group: Group) => {
    setUpdating(group.group_id);
    try {
      const res = await fetch(`/api/groups/${group.group_id}/auto_reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: group.settings?.user_id || '',
          auto_reply: !group.auto_reply
        })
      });
      if (!res.ok) throw new Error('Failed to update');
      setGroups(groups =>
        groups.map(g =>
          g.group_id === group.group_id ? { ...g, auto_reply: !g.auto_reply } : g
        )
      );
      toast({ title: 'Group setting updated', variant: 'success' });
    } catch {
      toast({ title: 'Failed to update group', variant: 'destructive' });
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">WhatsApp Groups</h1>
      {loading ? (
        <div>Loading...</div>
      ) : groups.length === 0 ? (
        <div>No groups found.</div>
      ) : (
        <ul className="space-y-4">
          {groups.map(group => (
            <li key={group.group_id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">{group.group_name || group.group_id}</div>
                <div className="text-sm text-gray-500">ID: {group.group_id}</div>
                <div className="text-sm text-gray-500">Auto Reply: {group.auto_reply ? 'On' : 'Ignored'}</div>
              </div>
              <Button
                disabled={updating === group.group_id}
                onClick={() => toggleIgnore(group)}
                variant={group.auto_reply ? 'destructive' : 'default'}
              >
                {group.auto_reply ? 'Ignore Messages' : 'Enable Auto Reply'}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
