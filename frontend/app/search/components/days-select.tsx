import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

export function DaysSelect() {
  return (
    <Select>
      <SelectTrigger className="w-[160px] h-12">
        <SelectValue placeholder="From"/>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem className="cursor-pointer" value="1">1 day ago</SelectItem>
          <SelectItem className="cursor-pointer" value="3">3 days ago</SelectItem>
          <SelectItem className="cursor-pointer" value="7">1 week ago</SelectItem>
          <SelectItem className="cursor-pointer" value="14">2 weeks ago</SelectItem>
          <SelectItem className="cursor-pointer" value="30">1 month ago</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
