import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { CURRENCIES } from "@/lib/brand.ts";
import DayBreakLogo from "@/components/DayBreakLogo.tsx";

export default function SettingsPage() {
  const profile = useQuery(api.users.getCurrentUser, {});
  const updateProfile = useMutation(api.users.updateProfile);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<{
    businessName: string;
    phone: string;
    address: string;
    currency: string;
    taxNumber: string;
  } | null>(null);

  if (profile && !form) {
    setForm({
      businessName: profile.businessName ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      currency: profile.currency ?? "ZMW",
      taxNumber: profile.taxNumber ?? "",
    });
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    try {
      await updateProfile({
        businessName: form.businessName || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        currency: form.currency || undefined,
        taxNumber: form.taxNumber || undefined,
      });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 pb-24 md:pb-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black" style={{ fontFamily: "Montserrat, sans-serif" }}>Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your business profile</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!profile || !form ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
            </div>
          ) : (
            <>
              <div>
                <Label>Your Name</Label>
                <Input value={profile.name ?? ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Managed via your account</p>
              </div>
              <div>
                <Label>Business Name</Label>
                <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="DayBreak Enterprise" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 234 567 8900" />
                </div>
                <div>
                  <Label>Tax / VAT Number</Label>
                  <Input value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} placeholder="VAT123456" />
                </div>
              </div>
              <div>
                <Label>Business Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St, City, Country" />
              </div>
              <div>
                <Label>Default Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.code} \u2014 {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Brand Identity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <DayBreakLogo size="md" />
          <div>
            <p className="font-semibold text-foreground">DayBreak Enterprise</p>
            <p className="text-xs text-muted-foreground">Your logo appears on all documents</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
