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
import { NAV_ITEMS } from '@/lib/constants';

export default function Page() {
  return (
    <AppLayout title="AI-GO" description="AI-powerd Language Learning">
      <div className="max-w-2xl">
        <div className="space-y-4">
          {NAV_ITEMS.map((item) => (
            <Item variant="outline" asChild key={item.href}>
              <Link href={item.href}>
                <ItemContent>
                  <ItemTitle>{item.label}</ItemTitle>
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
            <AccordionContent>
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
