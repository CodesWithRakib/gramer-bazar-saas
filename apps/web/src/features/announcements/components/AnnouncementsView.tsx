'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/toast/toast-store';
import {
  useCreateAnnouncementMutation,
  useSendAnnouncementMutation,
} from '../announcementsApi';
import { AnnouncementPriority, AnnouncementStatus, AudienceType } from '../types';
import { Role, useGetUsersQuery, User } from '../../users/usersApi';
import { Loader2, Send, Clock, Save, Megaphone, X, Search } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { useGetAnnouncementTemplatesQuery } from '../announcementsApi';
import { BackButton } from '@/components/common/BackButton';

export function AnnouncementsView() {
  const router = useRouter();
  const params = useParams();
  const isBn = params.lang === 'bn';
  
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation();
  const [sendAnnouncement, { isLoading: isSending }] = useSendAnnouncementMutation();

  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [message, setMessage] = useState('');
  const [messageBn, setMessageBn] = useState('');
  const [audienceType, setAudienceType] = useState<AudienceType>(AudienceType.EVERYONE);
  const [targetRoles, setTargetRoles] = useState<Role[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [priority, setPriority] = useState<AnnouncementPriority>(AnnouncementPriority.NORMAL);

  const [useTemplateMode, setUseTemplateMode] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');

  const { data: templates } = useGetAnnouncementTemplatesQuery();

  const { data: usersData, isFetching: isSearchingUsers } = useGetUsersQuery(
    { search: userSearchQuery, limit: 10 },
    { skip: audienceType !== AudienceType.SELECTED_USERS }
  );

  const handleCreateAndSend = async () => {
    if (!title || !message) {
      toast.error(isBn ? 'শিরোনাম এবং বার্তা আবশ্যক' : 'Title and message are required');
      return;
    }

    const targetUsers = selectedUsers.map(u => u.id);

    try {
      const announcement = await createAnnouncement({
        title,
        titleBn,
        message,
        messageBn,
        audienceType,
        targetRoles: audienceType === AudienceType.ROLE ? targetRoles : undefined,
        targetUsers: audienceType === AudienceType.SELECTED_USERS ? targetUsers : undefined,
        priority,
      }).unwrap();

      await sendAnnouncement(announcement.id).unwrap();
      
      toast.success(isBn ? 'ঘোষণা সফলভাবে পাঠানো হয়েছে' : 'Announcement sent successfully');
      setTitle('');
      setTitleBn('');
      setMessage('');
      setMessageBn('');
      
    } catch (error) {
      toast.error(isBn ? 'ঘোষণা পাঠাতে ব্যর্থ হয়েছে' : 'Failed to send announcement');
    }
  };

  const handleSaveDraft = async () => {
    if (!title || !message) {
      toast.error(isBn ? 'শিরোনাম এবং বার্তা আবশ্যক' : 'Title and message are required');
      return;
    }

    const targetUsers = selectedUsers.map(u => u.id);

    try {
      await createAnnouncement({
        title,
        titleBn,
        message,
        messageBn,
        audienceType,
        targetRoles: audienceType === AudienceType.ROLE ? targetRoles : undefined,
        targetUsers: audienceType === AudienceType.SELECTED_USERS ? targetUsers : undefined,
        priority,
        status: AnnouncementStatus.DRAFT,
      }).unwrap();
      
      toast.success(isBn ? 'খসড়া হিসেবে সংরক্ষিত' : 'Announcement saved as draft');
      setTitle('');
      setTitleBn('');
      setMessage('');
      setMessageBn('');
    } catch (error) {
      toast.error(isBn ? 'খসড়া সংরক্ষণ করতে ব্যর্থ হয়েছে' : 'Failed to save draft');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <BackButton
          href={`/${params.lang || 'en'}/super-admin/communication`}
          label="Back to Communication Hub"
          labelBn="কমিউনিকেশন হাবে ফিরে যান"
          lang={params.lang as string}
        />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-primary" />
              {isBn ? 'ঘোষণা তৈরি করুন' : 'Create Announcement'}
            </h2>
            <p className="text-muted-foreground">
              {isBn ? 'গ্রামের বাজার ব্যবহারকারীদের কাছে বার্তা এবং ঘোষণা সম্প্রচার করুন।' : 'Broadcast messages and announcements to Gramer Bazar users.'}
            </p>
          </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('./history')}>
            <Clock className="mr-2 h-4 w-4" /> {isBn ? 'ইতিহাস' : 'History'}
          </Button>
        </div>
      </div>
    </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {useTemplateMode && (
            <Card>
              <CardHeader>
                <CardTitle>{isBn ? 'টেমপ্লেট নির্বাচন করুন' : 'Select Template'}</CardTitle>
                <CardDescription>
                  {isBn ? 'একটি পূর্বনির্ধারিত টেমপ্লেট বেছে নিন।' : 'Choose a predefined template.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedTemplateId}
                  onValueChange={(val) => {
                    setSelectedTemplateId(val);
                    if (val !== 'none' && templates) {
                      const tmpl = templates.find(t => t.id === val);
                      if (tmpl) {
                        setTitle(tmpl.title);
                        setTitleBn(tmpl.titleBn || '');
                        setMessage(tmpl.message);
                        setMessageBn(tmpl.messageBn || '');
                        setAudienceType(tmpl.audienceType);
                        if (tmpl.targetRoles) setTargetRoles(tmpl.targetRoles);
                        setPriority(tmpl.priority);
                      }
                    } else {
                      setTitle(''); setTitleBn(''); setMessage(''); setMessageBn('');
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? 'টেমপ্লেট নির্বাচন করুন' : 'Select template'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{isBn ? 'কোনটি না' : 'None'}</SelectItem>
                    {templates?.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {isBn && t.titleBn ? t.titleBn : t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{isBn ? 'বিষয়বস্তু' : 'Content'}</CardTitle>
                <CardDescription>{isBn ? 'ঘোষণার মূল বিষয়বস্তু।' : 'The main content of the announcement.'}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="use-template" 
                  checked={useTemplateMode}
                  onCheckedChange={(checked) => setUseTemplateMode(!!checked)}
                />
                <Label htmlFor="use-template" className="cursor-pointer">
                  {isBn ? 'টেমপ্লেট ব্যবহার করুন' : 'Use Template'}
                </Label>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="en" className="flex-1">{isBn ? 'ইংরেজি' : 'English'}</TabsTrigger>
                  <TabsTrigger value="bn" className="flex-1">{isBn ? 'বাংলা' : 'Bangla'}</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{isBn ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}</Label>
                    <Input
                      placeholder={isBn ? 'উদাঃ Flash Sale Started!' : 'e.g. Flash Sale Started!'}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isBn ? 'বার্তা (ইংরেজি)' : 'Message (English)'}</Label>
                    <Textarea
                      placeholder={isBn ? 'এখানে ঘোষণার বিস্তারিত লিখুন (ইংরেজিতে)...' : 'Write your announcement details here...'}
                      className="min-h-[150px]"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="bn" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{isBn ? 'শিরোনাম (বাংলা)' : 'Title (Bangla)'}</Label>
                    <Input
                      placeholder={isBn ? 'উদাঃ ফ্ল্যাশ সেল শুরু হয়েছে!' : 'e.g. ফ্ল্যাশ সেল শুরু হয়েছে!'}
                      value={titleBn}
                      onChange={(e) => setTitleBn(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isBn ? 'বার্তা (বাংলা)' : 'Message (Bangla)'}</Label>
                    <Textarea
                      placeholder={isBn ? 'এখানে ঘোষণার বিস্তারিত লিখুন (বাংলায়)...' : 'এখানে ঘোষণার বিস্তারিত লিখুন...'}
                      className="min-h-[150px]"
                      value={messageBn}
                      onChange={(e) => setMessageBn(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="pt-4 border-t mt-4">
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    {isBn ? 'প্রিভিউ (উদাহরণ)' : 'Preview (Example)'}
                  </h4>
                  <div className="text-sm space-y-2">
                    <p><strong>{isBn ? 'শিরোনাম' : 'Title'}:</strong> {title.replace(/\{\{userName\}\}/g, 'Rakib Hasan') || (isBn ? 'শিরোনাম নেই' : 'No title')}</p>
                    <p className="whitespace-pre-wrap"><strong>{isBn ? 'বার্তা' : 'Message'}:</strong> {message.replace(/\{\{userName\}\}/g, 'Rakib Hasan') || (isBn ? 'বার্তা নেই' : 'No message')}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {isBn 
                        ? '* {{userName}} ডাইনামিক ভেরিয়েবলগুলো ব্যবহারকারীর নাম দিয়ে প্রতিস্থাপিত হবে।' 
                        : '* Dynamic variables like {{userName}} will be replaced with the actual user\'s name.'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isBn ? 'সেটিংস' : 'Settings'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{isBn ? 'কাঙ্ক্ষিত দর্শক' : 'Target Audience'}</Label>
                <Select
                  value={audienceType}
                  onValueChange={(val) => setAudienceType(val as AudienceType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? 'দর্শক নির্বাচন করুন' : 'Select audience'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AudienceType.EVERYONE}>{isBn ? 'সবাই' : 'Everyone'}</SelectItem>
                    <SelectItem value={AudienceType.ROLE}>{isBn ? 'নির্দিষ্ট ভূমিকা' : 'Specific Roles'}</SelectItem>
                    <SelectItem value={AudienceType.SELECTED_USERS}>{isBn ? 'নির্বাচিত ব্যবহারকারী' : 'Selected Users'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {audienceType === AudienceType.ROLE && (
                <div className="space-y-3 pt-2 border-t">
                  <Label>{isBn ? 'ভূমিকা নির্বাচন করুন' : 'Select Roles'}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['CUSTOMER', 'SELLER', 'RIDER', 'ADMIN'].map((r) => {
                      const roleLabel = isBn
                        ? r === 'CUSTOMER' ? 'গ্রাহক'
                        : r === 'SELLER' ? 'বিক্রেতা'
                        : r === 'RIDER' ? 'রাইডার'
                        : 'অ্যাডমিন'
                        : r.toLowerCase();

                      return (
                        <div key={r} className="flex items-center space-x-2">
                          <Checkbox
                            id={`role-${r}`}
                            checked={targetRoles.includes(r as Role)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setTargetRoles([...targetRoles, r as Role]);
                              } else {
                                setTargetRoles(targetRoles.filter(role => role !== r));
                              }
                            }}
                          />
                          <Label htmlFor={`role-${r}`} className="text-sm font-normal cursor-pointer capitalize">
                            {roleLabel}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {audienceType === AudienceType.SELECTED_USERS && (
                <div className="space-y-3 pt-2 border-t">
                  <Label>{isBn ? 'ব্যবহারকারী নির্বাচন করুন' : 'Select Users'}</Label>
                  
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={isBn ? 'নাম, ফোন বা ইমেইল দিয়ে খুঁজুন...' : 'Search by name, phone or email...'}
                      className="pl-9"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>

                  {userSearchQuery && (
                    <div className="border rounded-md max-h-48 overflow-y-auto bg-background">
                      {isSearchingUsers ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                          {isBn ? 'খুঁজছে...' : 'Searching...'}
                        </div>
                      ) : usersData?.data?.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          {isBn ? 'কোন ব্যবহারকারী পাওয়া যায়নি' : 'No users found'}
                        </div>
                      ) : (
                        <div className="py-1">
                          {usersData?.data?.map(user => {
                            const isSelected = selectedUsers.some(su => su.id === user.id);
                            return (
                              <div 
                                key={user.id} 
                                className={`px-4 py-2 text-sm flex justify-between items-center cursor-pointer hover:bg-muted ${isSelected ? 'bg-muted' : ''}`}
                                onClick={() => {
                                  if (!isSelected) {
                                    setSelectedUsers([...selectedUsers, user]);
                                    setUserSearchQuery('');
                                  }
                                }}
                              >
                                <div>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-xs text-muted-foreground">{user.phone} • {user.email}</div>
                                </div>
                                {isSelected && <Badge variant="secondary">{isBn ? 'নির্বাচিত' : 'Selected'}</Badge>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedUsers.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedUsers.map(user => (
                        <Badge key={user.id} variant="secondary" className="flex items-center gap-1 py-1">
                          {user.firstName} {user.lastName}
                          <X 
                            className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                            onClick={() => setSelectedUsers(selectedUsers.filter(su => su.id !== user.id))}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>{isBn ? 'অগ্রাধিকার' : 'Priority'}</Label>
                <Select
                  value={priority}
                  onValueChange={(val) => setPriority(val as AnnouncementPriority)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isBn ? 'অগ্রাধিকার নির্বাচন করুন' : 'Select priority'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AnnouncementPriority.NORMAL}>{isBn ? 'সাধারণ' : 'Normal'}</SelectItem>
                    <SelectItem value={AnnouncementPriority.IMPORTANT}>{isBn ? 'গুরুত্বপূর্ণ' : 'Important'}</SelectItem>
                    <SelectItem value={AnnouncementPriority.URGENT}>{isBn ? 'জরুরি' : 'Urgent'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4">
              <Button
                className="w-full"
                onClick={handleCreateAndSend}
                disabled={isCreating || isSending || !title || !message}
              >
                {isCreating || isSending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isBn ? 'এখন পাঠান' : 'Send Now'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSaveDraft}
                disabled={isCreating || isSending || !title || !message}
              >
                <Save className="mr-2 h-4 w-4" />
                {isBn ? 'খসড়া সংরক্ষণ করুন' : 'Save Draft'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
