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
  return (
    <>
      <h1 className="text-3xl font-bold">AI-GO</h1>
      <p className="text-muted-foreground text-xl">AI-powerd Language Learning</p>
      <div className="max-w-2xl">
        <Item variant="outline" asChild>
          <Link href="/speaking">
            <ItemContent>
              <ItemTitle>Speaking</ItemTitle>
              <ItemDescription>AIを活用したスピーキング練習</ItemDescription>
            </ItemContent>
            <ItemActions>
              <ExternalLinkIcon className="size-4" />
            </ItemActions>
          </Link>
        </Item>
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
    </>
  );
}
