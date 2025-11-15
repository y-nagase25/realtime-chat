import { ButtonGroupInputGroup } from '@/components/button-group-input-group'

export default function Page() {
  return (
    <div className="flex flex-col justify-center">
      <div className="theme-container mx-auto grid max-w-[2200px] gap-8 p-6 md:grid-cols-2 md:p-8 lg:grid-cols-3 xl:grid-cols-4">
        <div className="flex flex-col gap-6 *:[div]:w-full *:[div]:max-w-full">
          <ButtonGroupInputGroup />
        </div>
      </div>
    </div>
  )
}
