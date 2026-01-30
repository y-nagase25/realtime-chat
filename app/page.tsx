import { AppLayout } from '@/components/AppLayout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function Page() {
  const items = [
    {
      title: 'Reading',
      description: 'リーディング問題の自動生成と採点・解説',
      href: '/reading',
    },
    {
      title: 'Speaking',
      description: '文字起こしを活用したスピーキング練習',
      href: '/speaking',
    },
    {
      title: 'History',
      description: '学習履歴',
      href: '/history',
    },
  ];
  return (
    <AppLayout title="AI-GO" description="AI-powerd Language Learning">
      <div className="max-w-xl">
        <div className="space-y-4">
          {items.map((item) => (
            <Item variant="outline" asChild key={item.href}>
              <Link href={item.href}>
                <ItemContent>
                  <ItemTitle>{item.title}</ItemTitle>
                  <ItemDescription>{item.description}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ExternalLinkIcon className="size-4" />
                </ItemActions>
              </Link>
            </Item>
          ))}
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger>このアプリについて</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2 text-balance">
              <p>
                AIは不正確な情報を生成する可能性があります。重要な情報は必ずご自身で確認してください。
              </p>
              <p>入力されたデータがAIモデルの学習に使用されることはありません。</p>
              <p>
                音声、文字起こし、チャット履歴などのデータは、お使いのブラウザ内にのみ保存されます。
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </AppLayout>
  );
}
